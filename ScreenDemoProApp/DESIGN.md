# ScreenDemoPro 設計ドキュメント

DemoPro 風の macOS プレゼン補助アプリ。グローバルショートカットで「入力ロック + 画面に枠を表示」をワンタッチで切り替える。設定画面でショートカット・枠の色・枠の太さを変更可能。

実装は Claude Sonnet が直接着手できる粒度で記述。

---

## 1. 要件

### 機能要件
- グローバルショートカット 1 つで「プレゼンモード」をトグル ON/OFF
- プレゼンモード ON のとき:
  - 全スクリーンの最前面に半透明の枠（外周ボーダー）を表示
  - すべてのマウス・キーボード入力をブロック（解除ショートカットだけ通す）
  - メニューバーアイコンを赤系の「録画中」風に変える
- プレゼンモード OFF のとき:
  - 枠を消し、入力ブロックを解除する
- 設定画面（Preferences）で以下を変更:
  - トグル用ショートカット（Carbon HotKey で再登録）
  - 枠の色（NSColorWell）
  - 枠の太さ（4–40 pt のスライダー）
  - 起動時にメニューバー常駐するか
  - ログイン項目に追加するか（任意）

### 非機能要件
- macOS 13 (Ventura) 以降。Apple Silicon / Intel 両対応（Universal Binary）
- アプリ起動から枠表示まで 200 ms 以内
- マルチディスプレイ対応（接続/切断のホットプラグも追従）
- サンドボックス OFF（CGEventTap が必要なため、Direct Distribution 想定）

### 必要権限
| 権限 | 用途 | 取得タイミング |
|---|---|---|
| Accessibility | グローバルショートカット監視・入力ブロック | 初回トグル試行時に案内ダイアログ→システム設定を開く |
| Input Monitoring | CGEventTap で全入力を監視 | 同上 |

スクリーン録画権限は不要（描画のみ。画面キャプチャしない）。

---

## 2. アーキテクチャ概観

```
┌──────────────────────────────────────────────────────┐
│                      AppDelegate                     │
│  ・NSApplication.setActivationPolicy(.accessory)     │
│  ・MenuBarController を起動                           │
└──────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼──────────────────────┐
        ▼                 ▼                      ▼
┌──────────────┐  ┌──────────────────┐   ┌──────────────┐
│MenuBarCtrl   │  │PresentationMgr   │   │SettingsWindow│
│ NSStatusItem │◀─│ (中核 / Observable)│──▶│  (SwiftUI)   │
└──────────────┘  └──────────────────┘   └──────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
│HotKeyManager │  │OverlayManager│  │InputBlocker      │
│Carbon HotKey │  │NSPanel × N   │  │CGEventTap        │
└──────────────┘  └──────────────┘  └──────────────────┘
                          │
                          ▼
                  ┌──────────────────┐
                  │SettingsStore     │
                  │UserDefaults+@AppStorage│
                  └──────────────────┘
```

`PresentationManager` がアプリの状態機械（`isPresenting: Bool`）を持ち、ON/OFF 遷移時に `OverlayManager` と `InputBlocker` を駆動する。`HotKeyManager` から呼ばれるトグルイベントと、メニューバーからのトグルクリックはどちらも `PresentationManager.toggle()` を経由する。

---

## 3. ファイル構成

Xcode プロジェクトは `ScreenDemoPro.xcodeproj` 直下にフラット構成。

```
ScreenDemoPro/
├── ScreenDemoProApp.swift            # @main, AppDelegate アダプタ
├── AppDelegate.swift                 # 起動処理、Dock 非表示化
├── Core/
│   ├── PresentationManager.swift     # ObservableObject, 状態機械
│   ├── HotKeyManager.swift           # Carbon HotKey ラッパ
│   ├── OverlayManager.swift          # 全画面 NSPanel 群の管理
│   ├── OverlayWindow.swift           # NSPanel サブクラス
│   ├── OverlayBorderView.swift       # 枠を描く NSView (CALayer)
│   └── InputBlocker.swift            # CGEventTap
├── UI/
│   ├── MenuBarController.swift       # NSStatusItem + NSMenu
│   ├── SettingsView.swift            # SwiftUI 設定画面
│   ├── ShortcutRecorderView.swift    # ショートカット録音 UI
│   └── PermissionGate.swift          # 権限不足時の案内ビュー
├── Model/
│   ├── Settings.swift                # struct: AppSettings
│   ├── SettingsStore.swift           # @AppStorage / UserDefaults bridge
│   └── KeyCombo.swift                # キーコンボ表現 (keyCode + modifiers)
├── Resources/
│   ├── Assets.xcassets               # メニューバーアイコン (template)
│   └── Localizable.strings           # ja, en
└── Info.plist                        # LSUIElement=YES, 権限文言
```

---

## 4. データモデル

### 4.1 `KeyCombo`

```swift
struct KeyCombo: Codable, Equatable {
    let keyCode: UInt32          // Carbon kVK_*
    let modifiers: UInt32        // Carbon: cmdKey | optionKey | shiftKey | controlKey

    var displayString: String    // "⌃⌥⌘ P" など
    var isEmpty: Bool { keyCode == 0 && modifiers == 0 }

    static let `default` = KeyCombo(
        keyCode: UInt32(kVK_ANSI_P),
        modifiers: UInt32(cmdKey | optionKey | controlKey)
    )
}
```

### 4.2 `AppSettings`

```swift
struct AppSettings: Codable, Equatable {
    var toggleHotKey: KeyCombo = .default
    var borderColor: CodableColor = .init(.systemRed)
    var borderWidth: Double = 12.0           // pt, 4...40
    var blockInput: Bool = true              // false なら視覚表示のみ
    var launchAtLogin: Bool = false
}
```

`CodableColor` は `NSColor` を sRGB 4 成分で永続化する薄いラッパ。

### 4.3 `SettingsStore`

`UserDefaults.standard` を単一ソースに、`@Published var settings: AppSettings` を持つ `ObservableObject`。`didSet` で JSON エンコードして保存。SwiftUI 側は `@EnvironmentObject` で受ける。

UserDefaults キーは 1 個に集約: `"app.settings.v1"`（JSON）。スキーマ進化時は `.v2` を追加してマイグレーション関数を書く。

---

## 5. 中核コンポーネント詳細

### 5.1 PresentationManager

```swift
@MainActor
final class PresentationManager: ObservableObject {
    @Published private(set) var isPresenting = false

    private let overlay: OverlayManager
    private let blocker: InputBlocker
    private let store: SettingsStore

    func toggle() {
        isPresenting ? stop() : start()
    }

    func start() {
        guard PermissionChecker.hasAccessibility() else {
            PermissionChecker.requestAccessibility()
            return
        }
        overlay.show(color: store.settings.borderColor.nsColor,
                     width: store.settings.borderWidth)
        if store.settings.blockInput {
            blocker.start(passthrough: store.settings.toggleHotKey)
        }
        isPresenting = true
    }

    func stop() {
        blocker.stop()
        overlay.hide()
        isPresenting = false
    }
}
```

`SettingsStore` の `settings` を `Combine` で購読し、`isPresenting` 中に色・太さが変わったら `overlay.update(color:width:)` を呼ぶライブプレビュー。

### 5.2 HotKeyManager（Carbon HotKey）

NSEvent の global monitor では cmd 入りの組み合わせがアプリ非アクティブ時に取れないことがあるため、Carbon の `RegisterEventHotKey` を使う。

```swift
final class HotKeyManager {
    private var ref: EventHotKeyRef?
    private var handler: (() -> Void)?

    func register(_ combo: KeyCombo, handler: @escaping () -> Void) {
        unregister()
        self.handler = handler
        var hotKeyID = EventHotKeyID(signature: OSType("SDPR".fourCharCode), id: 1)
        var ref: EventHotKeyRef?
        RegisterEventHotKey(combo.keyCode, combo.modifiers, hotKeyID,
                            GetEventDispatcherTarget(), 0, &ref)
        self.ref = ref
        installEventHandlerOnce()
    }

    func unregister() {
        if let ref { UnregisterEventHotKey(ref) }
        ref = nil
    }
}
```

`installEventHandlerOnce()` は `InstallEventHandler` を 1 度だけ仕掛け、`Unmanaged.passUnretained(self).toOpaque()` を userData に渡して C コールバックから Swift メソッドにディスパッチ。

設定変更時は `register()` を呼び直すだけで切り替わる。

### 5.3 OverlayManager + OverlayWindow

ディスプレイごとに全画面 `NSPanel` を 1 つ生成。

```swift
final class OverlayWindow: NSPanel {
    init(screen: NSScreen) {
        super.init(contentRect: screen.frame,
                   styleMask: [.borderless, .nonactivatingPanel],
                   backing: .buffered,
                   defer: false)
        level = .screenSaver                       // メニューバーより上
        collectionBehavior = [.canJoinAllSpaces,
                              .stationary,
                              .fullScreenAuxiliary,
                              .ignoresCycle]
        backgroundColor = .clear
        isOpaque = false
        hasShadow = false
        ignoresMouseEvents = true                  // 視覚層は素通し
        isMovable = false
    }
    override var canBecomeKey: Bool { false }
    override var canBecomeMain: Bool { false }
}
```

`OverlayBorderView` は `wantsLayer = true` で、`CAShapeLayer` を使い `NSScreen.frame` の内側に「外周だけ塗る矩形パス」を描く。`borderColor` と `borderWidth` を更新するだけで再描画。

`OverlayManager` は `NSApplication.didChangeScreenParametersNotification` を監視して、ディスプレイ追加/削除時に再生成する。

### 5.4 InputBlocker（CGEventTap）

```swift
final class InputBlocker {
    private var tap: CFMachPort?
    private var runLoopSource: CFRunLoopSource?
    private var passthrough: KeyCombo?

    func start(passthrough: KeyCombo) {
        self.passthrough = passthrough
        let mask: CGEventMask =
            (1 << CGEventType.keyDown.rawValue) |
            (1 << CGEventType.keyUp.rawValue) |
            (1 << CGEventType.flagsChanged.rawValue) |
            (1 << CGEventType.leftMouseDown.rawValue) |
            (1 << CGEventType.leftMouseUp.rawValue) |
            (1 << CGEventType.rightMouseDown.rawValue) |
            (1 << CGEventType.rightMouseUp.rawValue) |
            (1 << CGEventType.otherMouseDown.rawValue) |
            (1 << CGEventType.otherMouseUp.rawValue) |
            (1 << CGEventType.mouseMoved.rawValue) |
            (1 << CGEventType.scrollWheel.rawValue) |
            (1 << CGEventType.leftMouseDragged.rawValue) |
            (1 << CGEventType.rightMouseDragged.rawValue)

        let refcon = Unmanaged.passUnretained(self).toOpaque()
        tap = CGEvent.tapCreate(
            tap: .cgSessionEventTap,
            place: .headInsertEventTap,
            options: .defaultTap,
            eventsOfInterest: mask,
            callback: InputBlocker.callback,
            userInfo: refcon
        )
        guard let tap else { return }
        runLoopSource = CFMachPortCreateRunLoopSource(nil, tap, 0)
        CFRunLoopAddSource(CFRunLoopGetCurrent(), runLoopSource, .commonModes)
        CGEvent.tapEnable(tap: tap, enable: true)
    }

    func stop() {
        if let tap { CGEvent.tapEnable(tap: tap, enable: false) }
        if let src = runLoopSource {
            CFRunLoopRemoveSource(CFRunLoopGetCurrent(), src, .commonModes)
        }
        tap = nil; runLoopSource = nil
    }

    private static let callback: CGEventTapCallBack = { _, type, event, refcon in
        guard let refcon else { return Unmanaged.passUnretained(event) }
        let me = Unmanaged<InputBlocker>.fromOpaque(refcon).takeUnretainedValue()

        // タップ自体が macOS から無効化された場合は再有効化
        if type == .tapDisabledByTimeout || type == .tapDisabledByUserInput {
            if let tap = me.tap { CGEvent.tapEnable(tap: tap, enable: true) }
            return Unmanaged.passUnretained(event)
        }

        // 解除ショートカットだけ通す
        if me.matchesPassthrough(event) {
            return Unmanaged.passUnretained(event)
        }
        return nil   // それ以外は破棄
    }
}
```

ポイント:
- 解除ショートカットは Carbon HotKey 経由で受けたいので CGEventTap でも通過させる必要がある。`matchesPassthrough` は keyDown と flagsChanged を見て `passthrough` の keyCode + modifierFlags と一致するかを判定。
- macOS は無応答タップを自動で無効化することがあるため `tapDisabledByTimeout` で必ず再有効化する。
- アプリがクラッシュしてもタップは macOS が解放するが、念のため `signal(SIGINT) / atexit` で `stop()` を呼んでおくと安心。

### 5.5 MenuBarController

`NSStatusItem` を作成し `NSImage(systemSymbolName: "rectangle.dashed")` をテンプレート画像として設定。プレゼンモード中は `"rectangle.dashed.badge.record"` 風の赤色画像に切り替え。

メニュー項目:
- ⏵ Start Presentation (⌃⌥⌘P)  — `PresentationManager.toggle()`
- Preferences…  — `SettingsWindow` を表示
- About ScreenDemoPro
- Quit

---

## 6. UI 設計

### 6.1 メニュー（メニューバー）
Dock アイコンは出さない（`Info.plist` の `LSUIElement = YES`）。トグル状態がアイコンに反映される。

### 6.2 設定画面（SwiftUI）

タブなしの単一ペイン、横 480 / 縦は内容に応じて自動。

```
┌──────────────────────────────────────────────┐
│ ScreenDemoPro Preferences                    │
├──────────────────────────────────────────────┤
│ Toggle shortcut                              │
│   [ ⌃⌥⌘ P ]  [Click to record]  [Reset]      │
│                                              │
│ Border                                       │
│   Color    [ColorWell▢]                       │
│   Width    [────●──────]  12 pt              │
│   Preview  ┌────────────┐                    │
│            │            │                    │
│            └────────────┘                    │
│                                              │
│ Behavior                                     │
│   ☑ Block mouse and keyboard input           │
│   ☐ Launch at login                          │
│                                              │
│ Permissions                                   │
│   Accessibility …………………… ✅ Granted          │
│   Input Monitoring ……………… ⚠️ Required        │
│   [Open System Settings]                     │
└──────────────────────────────────────────────┘
```

`ShortcutRecorderView` は `NSEvent.addLocalMonitorForEvents(matching: [.keyDown, .flagsChanged])` を録音中だけ仕掛けて、初の修飾キー＋通常キーの組を `KeyCombo` に変換。録音モード中は `Esc` でキャンセル、`⌫` でクリア。

`Preview` は実際の `OverlayBorderView` を縮小表示した SwiftUI ラッパ（`NSViewRepresentable`）。色・太さの変更がライブで反映され、本番枠とのズレをなくす。

### 6.3 権限ゲート
初回起動 or トグル試行時に権限不足を検知したら、設定画面が開きモーダルで案内シートを出す。`AXIsProcessTrustedWithOptions([kAXTrustedCheckOptionPrompt: true])` でシステムダイアログを出し、加えて `x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility` を `NSWorkspace.shared.open(_:)` で開くボタンを置く。

---

## 7. 状態遷移

```
        ┌─────────────┐  toggle / hotkey   ┌──────────────┐
        │   Idle      │ ─────────────────▶ │  Presenting  │
        │ (no overlay)│                    │ (overlay+tap)│
        │             │ ◀───────────────── │              │
        └─────────────┘   toggle / hotkey  └──────────────┘
              ▲                                   │
              │ permission denied                 │ display change
              │                                   ▼
        ┌─────────────┐                    ┌──────────────┐
        │ Permission  │                    │  Reconfigure │
        │  Required   │                    │  overlays    │
        └─────────────┘                    └──────────────┘
```

`Reconfigure overlays` は内部状態は変えず、`OverlayManager` がディスプレイ集合を再構築するだけ。

---

## 8. 実装ステップ（推奨順）

1. **プロジェクト作成**  Xcode → macOS App → SwiftUI / Swift。`LSUIElement = YES`。Hardened Runtime のみ ON、App Sandbox は OFF。
2. **`SettingsStore` と `KeyCombo` を実装**  まず単体テストでエンコード/デコード往復が壊れないことを確認。
3. **`MenuBarController` で空のメニューを出す**  ステータスバーに常駐できるか検証。
4. **`OverlayManager` を作って常時ピンクの枠を全画面に出す**  マルチディスプレイと Mission Control 切り替えで枠が残ることを確認。
5. **`HotKeyManager` でグローバルショートカットを取り、枠を ON/OFF**  ここで Accessibility 権限の案内も配線する。
6. **`InputBlocker` を追加し、解除ショートカットだけ通るようにする**  通らない場合は `cgAnnotatedSessionEventTap` も検討（デフォルトの `cgSessionEventTap` で十分なことが多い）。
7. **SwiftUI の設定画面を実装**  色・太さのライブプレビュー、ショートカットレコーダ。
8. **権限ゲート、ログイン項目（`SMAppService.mainApp`）、ローカライズ**。
9. **動作確認**:
   - Zoom 等の画面共有中にトグルしてカクつかないか
   - スリープ復帰後もホットキーが効くか（Carbon HotKey は通常そのまま生存）
   - macOS 13/14/15 で挙動差がないか
10. **配布**  Developer ID で署名 + 公証（notarize）。サンドボックス OFF のため Mac App Store は対象外。

---

## 9. 既知の落とし穴

- **CGEventTap が時々無効化される**: 高負荷時 macOS が `tapDisabledByTimeout` を投げて止める。コールバックで必ず再有効化すること（5.4 参照）。
- **解除ショートカットを取りこぼす**: Carbon HotKey と CGEventTap の両方を経由する。CGEventTap が「破棄」を返した瞬間、Carbon HotKey 側にもイベントが届かない。passthrough 判定を必ず CGEventTap 側でやる。
- **NSPanel が Spotlight や通知センターに隠れる**: `level = .screenSaver` でも上に来ないケースがある。必要なら `CGShieldingWindowLevel()` を使う。
- **複数ディスプレイの解像度差**: `NSScreen.frame` を使い、`screen.backingScaleFactor` で太さを pt→px 換算しない（pt のままで CALayer に渡すと自動でスケールされる）。
- **修飾キーだけのショートカット**: `flagsChanged` で keyCode 0 の組を録音できてしまう。`KeyCombo.isEmpty` を録音時に弾く。
- **アクセシビリティ権限の自動再付与**: ビルドごとに `code sign` のハッシュが変わると macOS は権限をリセットする。開発中は同じ Team ID + Bundle ID + 安定した署名で再ビルドする。

---

## 10. 受け入れテスト（手動チェックリスト）

- [ ] 初回起動でメニューバーアイコンが出る、Dock には出ない
- [ ] 既定ショートカット `⌃⌥⌘ P` で枠 ON/OFF が切り替わる
- [ ] 枠 ON 中はマウスクリックもキー入力も他アプリに届かない
- [ ] 枠 ON 中に解除ショートカットだけは効く
- [ ] 設定で色を緑にすると即座に枠が緑になる
- [ ] 設定で太さを 30 pt にすると即座に太くなる
- [ ] 設定でショートカットを `⌥ F1` に変えても効く
- [ ] 外部ディスプレイを差すと、新しい画面にも枠が出る
- [ ] アプリを再起動しても設定が保持される
- [ ] 権限が外れた状態でトグルすると案内が出てクラッシュしない

---

## 11. 拡張のヒント（v2 以降）

- 枠の代わりに「角だけマーカー」「半透明の暗幕＋穴あき矩形」など複数スタイル
- ホワイトボード（透明レイヤに `NSBezierPath` で描画）
- マウスカーソルのスポットライト演出
- タイマー / 経過時間の HUD
- iCloud で設定同期（`NSUbiquitousKeyValueStore`）
