import AppKit
import ApplicationServices

/// Accessibility / Input Monitoring の権限状態を確認・案内するユーティリティ。
enum PermissionChecker {

    // MARK: - Check

    static func hasAccessibility() -> Bool {
        AXIsProcessTrusted()
    }

    // MARK: - Request

    /// システムダイアログを出して権限を要求する。
    /// 初回呼び出しでダイアログが表示されるが、2 回目以降は反応しない場合があるため
    /// システム設定を直接開くボタンも UI 側に配置すること。
    @discardableResult
    static func requestAccessibility() -> Bool {
        let options: NSDictionary = [
            kAXTrustedCheckOptionPrompt.takeRetainedValue() as String: true
        ]
        return AXIsProcessTrustedWithOptions(options)
    }

    // MARK: - Open Settings

    static func openAccessibilitySettings() {
        let url = URL(string:
            "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility"
        )!
        NSWorkspace.shared.open(url)
    }

    static func openInputMonitoringSettings() {
        let url = URL(string:
            "x-apple.systempreferences:com.apple.preference.security?Privacy_ListenEvent"
        )!
        NSWorkspace.shared.open(url)
    }
}
