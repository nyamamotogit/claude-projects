import AppKit
import Carbon.HIToolbox

final class CanvasView: NSView {

    var strokeColor:  NSColor     = NSColor(srgbRed: 1.0, green: 0.0, blue: 0.6, alpha: 1.0)
    var strokeWidth:  CGFloat     = 4.0
    var currentTool:  DrawingTool = .freehand
    var fadeEnabled:  Bool        = false
    var fadeDelay:    TimeInterval = 2.0
    var fadeDuration: TimeInterval = 1.0

    var onEscape:       (() -> Void)?
    var onToolChanged:  ((DrawingTool) -> Void)?
    var onFadeToggle:   (() -> Void)?

    private var strokes:       [Stroke] = []
    private var currentStroke: Stroke?
    private var fadeTimer:     Timer?

    override var acceptsFirstResponder: Bool { true }

    override init(frame frameRect: NSRect) {
        super.init(frame: frameRect)
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
    }

    // 外部ディスプレイでも最初のクリックで即反応するために必須
    override func acceptsFirstMouse(for event: NSEvent?) -> Bool { true }

    // MARK: - Public

    func clearAll() {
        strokes.removeAll()
        currentStroke = nil
        stopFadeTimer()
        needsDisplay = true
    }

    func undo() {
        guard !strokes.isEmpty else { return }
        strokes.removeLast()
        if strokes.isEmpty { stopFadeTimer() }
        needsDisplay = true
    }

    // MARK: - Mouse Events

    override func mouseDown(with event: NSEvent) {
        window?.makeKey()
        let point = convert(event.locationInWindow, from: nil)
        currentStroke = Stroke(
            tool:      currentTool,
            color:     strokeColor,
            lineWidth: strokeWidth,
            points:    [point]
        )
        needsDisplay = true
    }

    override func mouseDragged(with event: NSEvent) {
        let point = convert(event.locationInWindow, from: nil)
        currentStroke?.points.append(point)
        needsDisplay = true
    }

    override func mouseUp(with event: NSEvent) {
        let point = convert(event.locationInWindow, from: nil)
        currentStroke?.points.append(point)
        if var stroke = currentStroke {
            stroke.completedAt = Date()
            strokes.append(stroke)
        }
        currentStroke = nil
        needsDisplay = true

        if fadeEnabled { startFadeTimer() }
    }

    // MARK: - Keyboard

    override func keyDown(with event: NSEvent) {
        switch Int(event.keyCode) {
        case kVK_Escape:
            onEscape?()
        case kVK_Delete, kVK_ForwardDelete:
            undo()
        case kVK_ANSI_F:
            currentTool = .freehand
            onToolChanged?(.freehand)
        case kVK_ANSI_R:
            currentTool = .rectangle
            onToolChanged?(.rectangle)
        case kVK_ANSI_A:
            currentTool = .arrow
            onToolChanged?(.arrow)
        case kVK_ANSI_T:
            onFadeToggle?()
        default:
            super.keyDown(with: event)
        }
    }

    // MARK: - Drawing

    override func draw(_ dirtyRect: NSRect) {
        NSColor.clear.set()
        dirtyRect.fill()

        for stroke in strokes {
            let alpha: CGFloat = fadeEnabled
                ? stroke.opacity(fadeAfter: fadeDelay, fadeDuration: fadeDuration)
                : 1.0
            guard alpha > 0 else { continue }
            stroke.color.withAlphaComponent(stroke.color.alphaComponent * alpha).setStroke()
            stroke.path().stroke()
        }

        if let current = currentStroke {
            current.color.setStroke()
            current.path().stroke()
        }
    }

    override func hitTest(_ point: NSPoint) -> NSView? { self }

    // MARK: - Fade Timer

    private func startFadeTimer() {
        stopFadeTimer()
        // 60fps でリドロー、完全消滅したストロークを定期的に削除
        fadeTimer = Timer.scheduledTimer(withTimeInterval: 1.0 / 60.0, repeats: true) { [weak self] _ in
            guard let self else { return }
            self.needsDisplay = true
            // 完全に消えたストロークを除去
            self.strokes.removeAll { stroke in
                guard let t = stroke.completedAt else { return false }
                return Date().timeIntervalSince(t) > self.fadeDelay + self.fadeDuration + 0.1
            }
            if self.strokes.isEmpty {
                self.stopFadeTimer()
            }
        }
    }

    private func stopFadeTimer() {
        fadeTimer?.invalidate()
        fadeTimer = nil
    }
}
