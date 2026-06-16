import Carbon

// MARK: - Module-level handler storage (C callback から参照するため file-private)

/// hotKeyID.id → コールバックのマッピング
private var _hotKeyHandlers: [UInt32: () -> Void] = [:]

/// Carbon EventHandler の登録状態（1 度だけ登録する）
private var _eventHandlerRef: EventHandlerRef?

/// グローバルショートカットイベントを受け取る C 互換コールバック
private func hotKeyEventCallback(
    _ callRef: EventHandlerCallRef?,
    _ event:   EventRef?,
    _ userData: UnsafeMutableRawPointer?
) -> OSStatus {
    var hkID = EventHotKeyID()
    GetEventParameter(
        event,
        EventParamName(kEventParamDirectObject),
        EventParamType(typeEventHotKeyID),
        nil,
        MemoryLayout<EventHotKeyID>.size,
        nil,
        &hkID
    )
    _hotKeyHandlers[hkID.id]?()
    return noErr
}

// MARK: - HotKeyManager

/// Carbon `RegisterEventHotKey` を使ったグローバルショートカットマネージャ。
/// NSEvent の global monitor は非アクティブ時に cmd 入りのショートカットを取りこぼすことがあるため
/// Carbon を使っている。
final class HotKeyManager {

    private var hotKeyRef: EventHotKeyRef?
    private var assignedID: UInt32?

    private static var idCounter: UInt32 = 99   // インクリメントして使う

    // MARK: - Public API

    func register(_ combo: KeyCombo, handler: @escaping () -> Void) {
        unregister()
        guard !combo.isEmpty else { return }

        Self.ensureHandlerInstalled()

        Self.idCounter += 1
        let id = Self.idCounter
        assignedID         = id
        _hotKeyHandlers[id] = handler

        var hkID = EventHotKeyID(signature: fourCC("SDPR"), id: id)
        var ref:  EventHotKeyRef?
        let status = RegisterEventHotKey(
            combo.keyCode,
            combo.modifiers,
            hkID,
            GetEventDispatcherTarget(),
            0,
            &ref
        )
        if status == noErr {
            hotKeyRef = ref
        } else {
            // 登録失敗（権限不足など）
            _hotKeyHandlers.removeValue(forKey: id)
            assignedID = nil
        }
    }

    func unregister() {
        if let ref = hotKeyRef {
            UnregisterEventHotKey(ref)
            hotKeyRef = nil
        }
        if let id = assignedID {
            _hotKeyHandlers.removeValue(forKey: id)
            assignedID = nil
        }
    }

    deinit { unregister() }

    // MARK: - Private

    /// EventHandler をアプリの生存期間に 1 度だけ登録する
    private static func ensureHandlerInstalled() {
        guard _eventHandlerRef == nil else { return }
        var spec = EventTypeSpec(
            eventClass: OSType(kEventClassKeyboard),
            eventKind:  UInt32(kEventHotKeyPressed)
        )
        InstallEventHandler(
            GetEventDispatcherTarget(),
            hotKeyEventCallback,
            1,
            &spec,
            nil,
            &_eventHandlerRef
        )
    }
}
