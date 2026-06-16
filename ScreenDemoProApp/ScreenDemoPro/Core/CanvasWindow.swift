import AppKit

final class CanvasWindow: NSPanel {

    let canvasView: CanvasView

    init(screen: NSScreen) {
        canvasView = CanvasView(frame: NSRect(origin: .zero, size: screen.frame.size))

        super.init(
            contentRect: screen.frame,
            styleMask:   [.borderless, .nonactivatingPanel],
            backing:     .buffered,
            defer:       false
        )

        level              = NSWindow.Level(rawValue: Int(CGWindowLevelForKey(.floatingWindow)) + 1)
        collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary]
        backgroundColor    = .clear
        isOpaque           = false
        hasShadow          = false
        ignoresMouseEvents = false
        isMovable          = false
        hidesOnDeactivate  = false
        acceptsMouseMovedEvents = true

        setFrameOrigin(screen.frame.origin)
        contentView = canvasView
    }

    required init?(coder: NSCoder) { fatalError("not supported") }

    override var canBecomeKey: Bool { true }
    override var canBecomeMain: Bool { false }

    // どのディスプレイでもクリックしたら即座にkeyになる
    override func mouseDown(with event: NSEvent) {
        makeKey()
        super.mouseDown(with: event)
    }
}
