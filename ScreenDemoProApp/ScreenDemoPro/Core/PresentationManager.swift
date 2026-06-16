import AppKit
import Combine

@MainActor
final class PresentationManager: ObservableObject {

    @Published private(set) var isPresenting = false
    @Published var currentTool: DrawingTool  = .freehand

    private let store:        SettingsStore
    private let hotKey: HotKeyManager = HotKeyManager()
    private var canvasWindows: [CanvasWindow] = []
    private var cancellables = Set<AnyCancellable>()

    init(store: SettingsStore) {
        self.store = store
        self.currentTool = store.settings.defaultTool
        registerHotKeys()

        store.$settings
            .dropFirst()
            .receive(on: DispatchQueue.main)
            .sink { [weak self] s in self?.handleSettingsChange(s) }
            .store(in: &cancellables)

        NotificationCenter.default
            .publisher(for: NSApplication.didChangeScreenParametersNotification)
            .receive(on: DispatchQueue.main)
            .sink { [weak self] _ in self?.handleScreenChange() }
            .store(in: &cancellables)

        NSWorkspace.shared.notificationCenter
            .publisher(for: NSWorkspace.willSleepNotification)
            .receive(on: DispatchQueue.main)
            .sink { [weak self] _ in self?.stop() }
            .store(in: &cancellables)
    }

    deinit { hotKey.unregister() }

    // MARK: - Public

    func toggle() {
        isPresenting ? stop() : start()
    }

    func toggleFade() {
        store.settings.fadeEnabled.toggle()
        for win in canvasWindows {
            win.canvasView.fadeEnabled = store.settings.fadeEnabled
        }
    }

    func start() {
        guard !isPresenting else { return }
        currentTool = store.settings.defaultTool
        showCanvas()
        isPresenting = true
    }

    func stop() {
        guard isPresenting else { return }
        hideCanvas()
        isPresenting = false
    }

    func selectTool(_ tool: DrawingTool) {
        currentTool = tool
        for win in canvasWindows {
            win.canvasView.currentTool = tool
        }
    }

    // MARK: - Canvas

    private func showCanvas() {
        let s = store.settings
        for screen in NSScreen.screens {
            let win = CanvasWindow(screen: screen)
            applySettings(s, to: win.canvasView)
            win.canvasView.onEscape = { [weak self] in
                Task { @MainActor in self?.stop() }
            }
            win.canvasView.onToolChanged = { [weak self] tool in
                Task { @MainActor in self?.currentTool = tool }
            }
            win.canvasView.onFadeToggle = { [weak self] in
                Task { @MainActor in self?.toggleFade() }
            }
            win.orderFrontRegardless()
            win.makeKey()
            canvasWindows.append(win)
        }
        canvasWindows.first?.makeKey()
    }

    private func hideCanvas() {
        for win in canvasWindows {
            win.canvasView.clearAll()
            win.orderOut(nil)
        }
        canvasWindows.removeAll()
    }

    private func applySettings(_ s: AppSettings, to view: CanvasView) {
        view.strokeColor  = s.strokeColor.nsColor
        view.strokeWidth  = CGFloat(s.strokeWidth)
        view.currentTool  = currentTool
        view.fadeEnabled  = s.fadeEnabled
        view.fadeDelay    = s.fadeDelay
        view.fadeDuration = s.fadeDuration
    }

    // MARK: - HotKeys

    private func registerHotKeys() {
        hotKey.register(store.settings.toggleHotKey) { [weak self] in
            Task { @MainActor in self?.toggle() }
        }
    }

    private func handleSettingsChange(_ s: AppSettings) {
        hotKey.register(s.toggleHotKey) { [weak self] in
            Task { @MainActor in self?.toggle() }
        }
        for win in canvasWindows {
            applySettings(s, to: win.canvasView)
        }
    }

    private func handleScreenChange() {
        guard isPresenting else { return }
        hideCanvas()
        showCanvas()
    }
}
