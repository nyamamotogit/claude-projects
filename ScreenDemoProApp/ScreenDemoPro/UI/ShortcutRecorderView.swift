import AppKit
import SwiftUI
import Carbon.HIToolbox

// MARK: - ShortcutRecorderNSView

/// ショートカットを録音するネイティブ NSView。
/// クリックすると録音モードに入り、Modifier+Key を入力すると KeyCombo に変換する。
/// - Esc でキャンセル
/// - ⌫ / ⌦ でクリア
final class ShortcutRecorderNSView: NSView {

    var keyCombo: KeyCombo = .empty {
        didSet { updateLabel() }
    }
    var onCommit: ((KeyCombo) -> Void)?

    private var isRecording = false
    private let label     = NSTextField(labelWithString: "")
    private let recordBtn = NSButton()
    private var eventMonitor: Any?

    // MARK: - Init

    override init(frame frameRect: NSRect) {
        super.init(frame: frameRect)
        setup()
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setup()
    }

    private func setup() {
        // 現在のショートカット表示ラベル
        label.font              = .monospacedSystemFont(ofSize: 13, weight: .regular)
        label.alignment         = .center
        label.isBordered        = false
        label.backgroundColor   = .clear
        label.setContentHuggingPriority(.defaultLow, for: .horizontal)
        addSubview(label)

        // 録音ボタン
        recordBtn.bezelStyle  = .rounded
        recordBtn.target      = self
        recordBtn.action      = #selector(toggleRecording)
        addSubview(recordBtn)

        updateLabel()
        updateButton()

        // Auto Layout
        label.translatesAutoresizingMaskIntoConstraints     = false
        recordBtn.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            label.leadingAnchor.constraint(equalTo: leadingAnchor),
            label.centerYAnchor.constraint(equalTo: centerYAnchor),
            label.widthAnchor.constraint(equalToConstant: 120),

            recordBtn.leadingAnchor.constraint(equalTo: label.trailingAnchor, constant: 8),
            recordBtn.trailingAnchor.constraint(equalTo: trailingAnchor),
            recordBtn.centerYAnchor.constraint(equalTo: centerYAnchor),
        ])
    }

    // MARK: - Recording

    @objc private func toggleRecording() {
        isRecording ? stopRecording(commit: false) : startRecording()
    }

    private func startRecording() {
        isRecording = true
        updateButton()
        label.stringValue = "キーを入力…"
        label.textColor   = .secondaryLabelColor

        eventMonitor = NSEvent.addLocalMonitorForEvents(matching: [.keyDown, .flagsChanged]) {
            [weak self] event -> NSEvent? in
            guard let self else { return event }

            // Esc → キャンセル
            if event.keyCode == UInt16(kVK_Escape) {
                self.stopRecording(commit: false)
                return nil
            }

            // Delete → クリア
            if event.keyCode == UInt16(kVK_Delete)
                || event.keyCode == UInt16(kVK_ForwardDelete) {
                self.keyCombo = .empty
                self.stopRecording(commit: true)
                return nil
            }

            // flagsChanged だけでは未確定（修飾キーのみ）
            guard event.type == .keyDown else { return nil }

            let carbonMods = KeyCombo.carbonModifiers(from: event.modifierFlags)
            // 修飾キーなしの単打は無効
            guard carbonMods != 0 else { return nil }

            let combo = KeyCombo(keyCode: UInt32(event.keyCode), modifiers: carbonMods)
            guard !combo.isEmpty else { return nil }

            self.keyCombo = combo
            self.stopRecording(commit: true)
            return nil
        }
    }

    private func stopRecording(commit: Bool) {
        isRecording = false
        if let monitor = eventMonitor {
            NSEvent.removeMonitor(monitor)
            eventMonitor = nil
        }
        updateLabel()
        updateButton()
        if commit { onCommit?(keyCombo) }
    }

    // MARK: - UI Update

    private func updateLabel() {
        label.textColor   = .labelColor
        label.stringValue = keyCombo.isEmpty ? "未設定" : keyCombo.displayString
    }

    private func updateButton() {
        recordBtn.title = isRecording ? "キャンセル" : "変更"
    }
}

// MARK: - SwiftUI Representable

/// ShortcutRecorderNSView を SwiftUI から使うラッパ。
struct ShortcutRecorderView: NSViewRepresentable {

    @Binding var keyCombo: KeyCombo

    func makeNSView(context: Context) -> ShortcutRecorderNSView {
        let v = ShortcutRecorderNSView()
        v.keyCombo  = keyCombo
        v.onCommit  = { [self] newCombo in
            DispatchQueue.main.async { self.keyCombo = newCombo }
        }
        return v
    }

    func updateNSView(_ nsView: ShortcutRecorderNSView, context: Context) {
        if nsView.keyCombo != keyCombo {
            nsView.keyCombo = keyCombo
        }
    }
}
