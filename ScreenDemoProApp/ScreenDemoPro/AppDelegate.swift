import AppKit
import SwiftUI

final class AppDelegate: NSObject, NSApplicationDelegate {

    let store = SettingsStore.shared
    var presentationManager: PresentationManager!
    private var menuBarController: MenuBarController?
    private var settingsWindow: NSWindow?

    @MainActor func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.accessory)
        presentationManager = PresentationManager(store: store)
        menuBarController = MenuBarController(
            presentationManager: presentationManager,
            store: store,
            showSettings: { [weak self] in self?.showSettings() }
        )
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        false
    }

    @MainActor func showSettings() {
        if settingsWindow == nil {
            let rootView = SettingsView()
                .environmentObject(store)
                .environmentObject(presentationManager)
                .frame(width: 480)

            let vc = NSHostingController(rootView: rootView)
            vc.view.setFrameSize(NSSize(width: 480, height: 520))

            let window = NSWindow(
                contentRect: NSRect(x: 0, y: 0, width: 480, height: 520),
                styleMask:   [.titled, .closable, .miniaturizable, .resizable],
                backing:     .buffered,
                defer:       false
            )
            window.title                = "ScreenDemoPro 設定"
            window.contentViewController = vc
            window.isReleasedWhenClosed = false
            window.minSize             = NSSize(width: 400, height: 400)
            window.center()
            settingsWindow = window
        }

        settingsWindow?.makeKeyAndOrderFront(nil)
        if #available(macOS 14.0, *) {
            NSApp.activate()
        } else {
            NSApp.activate(ignoringOtherApps: true)
        }
    }
}
