import SwiftUI
import AppKit
import ServiceManagement

// MARK: - ColorPreset

private struct ColorPreset: Identifiable {
    let id    = UUID()
    let name:  String
    let color: CodableColor
}

private let colorPresets: [ColorPreset] = [
    .init(name: "マゼンタ", color: .defaultMagenta),
    .init(name: "赤",       color: .defaultRed),
    .init(name: "青",       color: .defaultBlue),
    .init(name: "緑",       color: .defaultGreen),
    .init(name: "オレンジ", color: .defaultOrange),
    .init(name: "黄",       color: .defaultYellow),
]

// MARK: - SettingsView

struct SettingsView: View {

    @EnvironmentObject private var store: SettingsStore
    @EnvironmentObject private var pm:    PresentationManager

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                shortcutSection
                toolSection
                strokeSection
                fadeSection
                behaviorSection
                helpSection
            }
            .padding(24)
        }
        .frame(width: 480)
    }

    // MARK: - Sections

    private var shortcutSection: some View {
        SectionBox(title: "トグルショートカット", icon: "keyboard") {
            ShortcutRow(
                label: "プレゼンモード切替",
                keyCombo: Binding(
                    get: { store.settings.toggleHotKey },
                    set: { store.settings.toggleHotKey = $0 }
                ),
                onReset: { store.settings.toggleHotKey = .default }
            )
        }
    }

    private var toolSection: some View {
        SectionBox(title: "デフォルトツール", icon: "paintbrush.pointed") {
            Picker("", selection: Binding(
                get: { store.settings.defaultTool },
                set: { store.settings.defaultTool = $0 }
            )) {
                ForEach(DrawingTool.allCases, id: \.self) { tool in
                    Label(tool.displayName, systemImage: tool.iconName).tag(tool)
                }
            }
            .pickerStyle(.segmented)
            .labelsHidden()
        }
    }

    private var strokeSection: some View {
        SectionBox(title: "描画スタイル", icon: "paintbrush") {
            VStack(alignment: .leading, spacing: 14) {
                VStack(alignment: .leading, spacing: 6) {
                    Text("色")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    HStack(spacing: 8) {
                        ForEach(colorPresets) { preset in
                            presetButton(preset)
                        }
                        ColorPicker("", selection: Binding(
                            get: { store.settings.strokeColor.swiftUIColor },
                            set: { store.settings.strokeColor = CodableColor(NSColor($0)) }
                        ))
                        .labelsHidden()
                        .frame(width: 28, height: 28)
                        .help("カスタムカラー")
                    }
                }
                Divider()
                HStack {
                    Text("太さ")
                        .frame(width: 40, alignment: .leading)
                    Slider(
                        value: Binding(
                            get: { store.settings.strokeWidth },
                            set: { store.settings.strokeWidth = $0 }
                        ),
                        in: 2...20, step: 1
                    )
                    Text("\(Int(store.settings.strokeWidth)) pt")
                        .monospacedDigit()
                        .frame(width: 44, alignment: .trailing)
                }
            }
        }
    }

    private var fadeSection: some View {
        SectionBox(title: "フェードアウト", icon: "sparkles") {
            VStack(alignment: .leading, spacing: 12) {
                Toggle(
                    "描画後に自動でフェードアウト",
                    isOn: Binding(
                        get: { store.settings.fadeEnabled },
                        set: { store.settings.fadeEnabled = $0 }
                    )
                )

                if store.settings.fadeEnabled {
                    Divider()

                    HStack {
                        Text("開始まで")
                            .frame(width: 70, alignment: .leading)
                        Slider(
                            value: Binding(
                                get: { store.settings.fadeDelay },
                                set: { store.settings.fadeDelay = $0 }
                            ),
                            in: 0.5...10.0, step: 0.5
                        )
                        Text(String(format: "%.1f 秒", store.settings.fadeDelay))
                            .monospacedDigit()
                            .frame(width: 52, alignment: .trailing)
                    }

                    HStack {
                        Text("消去時間")
                            .frame(width: 70, alignment: .leading)
                        Slider(
                            value: Binding(
                                get: { store.settings.fadeDuration },
                                set: { store.settings.fadeDuration = $0 }
                            ),
                            in: 0.2...5.0, step: 0.2
                        )
                        Text(String(format: "%.1f 秒", store.settings.fadeDuration))
                            .monospacedDigit()
                            .frame(width: 52, alignment: .trailing)
                    }

                }
            }
        }
    }

    private var behaviorSection: some View {
        SectionBox(title: "動作", icon: "gearshape") {
            Toggle(
                "ログイン時に自動起動",
                isOn: Binding(
                    get: { SMAppService.mainApp.status == .enabled },
                    set: { newVal in
                        store.settings.launchAtLogin = newVal
                        setLaunchAtLogin(newVal)
                    }
                )
            )
        }
    }

    private var helpSection: some View {
        SectionBox(title: "キーボードショートカット（描画中）", icon: "questionmark.circle") {
            VStack(alignment: .leading, spacing: 6) {
                shortcutRow("F", "フリーハンド")
                shortcutRow("R", "矩形")
                shortcutRow("A", "矢印")
                shortcutRow("T", "フェードON/OFF切替")
                shortcutRow("⌫", "取り消し (Undo)")
                shortcutRow("Esc", "プレゼンモード終了")
            }
        }
    }

    // MARK: - Helpers

    private func presetButton(_ preset: ColorPreset) -> some View {
        let isSelected = store.settings.strokeColor == preset.color
        return Button(action: { store.settings.strokeColor = preset.color }) {
            Circle()
                .fill(Color(preset.color.nsColor))
                .frame(width: 24, height: 24)
                .overlay(
                    Circle()
                        .stroke(Color.primary.opacity(0.3), lineWidth: isSelected ? 2.5 : 0)
                        .padding(-3)
                )
                .shadow(color: Color(preset.color.nsColor).opacity(0.5), radius: isSelected ? 4 : 0)
        }
        .buttonStyle(.plain)
        .help(preset.name)
    }

    private func shortcutRow(_ key: String, _ desc: String) -> some View {
        HStack {
            Text(key)
                .font(.system(.body, design: .monospaced))
                .frame(width: 40, alignment: .center)
                .padding(2)
                .background(Color(NSColor.controlBackgroundColor))
                .cornerRadius(4)
                .overlay(
                    RoundedRectangle(cornerRadius: 4)
                        .stroke(Color(NSColor.separatorColor), lineWidth: 0.5)
                )
            Text(desc)
                .foregroundColor(.secondary)
        }
    }

    private func setLaunchAtLogin(_ enabled: Bool) {
        do {
            if enabled { try SMAppService.mainApp.register() }
            else        { try SMAppService.mainApp.unregister() }
        } catch {
            // 失敗時はUserDefaultsの値を元に戻す
            store.settings.launchAtLogin = !enabled
            print("[Settings] Launch at login error: \(error)")
        }
    }
}

// MARK: - ShortcutRow

private struct ShortcutRow: View {
    let label:    String
    @Binding var keyCombo: KeyCombo
    let onReset:  () -> Void

    var body: some View {
        HStack(spacing: 12) {
            Text(label)
                .frame(width: 130, alignment: .leading)
            ShortcutRecorderView(keyCombo: $keyCombo)
                .frame(height: 28)
            Button("リセット", action: onReset)
                .buttonStyle(.link)
        }
    }
}

// MARK: - SectionBox

private struct SectionBox<Content: View>: View {
    let title: String
    let icon:  String
    @ViewBuilder let content: () -> Content

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label(title, systemImage: icon)
                .font(.headline)

            content()
                .padding(12)
                .background(Color(NSColor.controlBackgroundColor))
                .cornerRadius(8)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(Color(NSColor.separatorColor), lineWidth: 0.5)
                )
        }
    }
}
