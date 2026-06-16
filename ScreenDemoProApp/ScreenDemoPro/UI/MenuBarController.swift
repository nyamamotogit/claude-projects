import AppKit
import Combine

@MainActor final class MenuBarController {

    private var statusItem: NSStatusItem?
    private var menu:       NSMenu?

    private let presentationManager: PresentationManager
    private let store:               SettingsStore
    private let showSettingsAction:  () -> Void

    private var cancellables = Set<AnyCancellable>()

    init(
        presentationManager: PresentationManager,
        store: SettingsStore,
        showSettings: @escaping () -> Void
    ) {
        self.presentationManager = presentationManager
        self.store               = store
        self.showSettingsAction  = showSettings

        setupStatusItem()
        observeState()
    }

    private func setupStatusItem() {
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.squareLength)
        statusItem?.button?.image   = icon(active: false)
        statusItem?.button?.toolTip = "ScreenDemoPro"
        buildMenu()
        statusItem?.menu = menu
    }

    private func buildMenu() {
        let m = NSMenu()

        let toggleItem = NSMenuItem(
            title:         "プレゼンモード開始",
            action:        #selector(togglePresentation),
            keyEquivalent: ""
        )
        toggleItem.target = self
        toggleItem.tag    = 1
        m.addItem(toggleItem)

        m.addItem(.separator())

        let prefsItem = NSMenuItem(
            title:         "設定…",
            action:        #selector(openSettings),
            keyEquivalent: ","
        )
        prefsItem.target = self
        m.addItem(prefsItem)

        m.addItem(.separator())

        let quitItem = NSMenuItem(
            title:         "終了",
            action:        #selector(NSApplication.terminate(_:)),
            keyEquivalent: "q"
        )
        m.addItem(quitItem)

        menu = m
    }

    private func observeState() {
        presentationManager.$isPresenting
            .receive(on: DispatchQueue.main)
            .sink { [weak self] presenting in
                self?.updateUI(presenting: presenting)
            }
            .store(in: &cancellables)
    }

    private func updateUI(presenting: Bool) {
        statusItem?.button?.image     = icon(active: presenting)
        menu?.item(withTag: 1)?.title = presenting ? "プレゼンモード終了" : "プレゼンモード開始"
    }

    private func icon(active: Bool) -> NSImage {
        let name = active ? "pencil.tip.crop.circle.fill" : "pencil.tip.crop.circle"
        let img  = NSImage(systemSymbolName: name, accessibilityDescription: nil) ?? NSImage()
        img.isTemplate = true
        return img
    }

    @objc private func togglePresentation() {
        Task { @MainActor in presentationManager.toggle() }
    }

    @objc private func openSettings() {
        showSettingsAction()
    }
}
