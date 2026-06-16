import Foundation
import Combine

final class SettingsStore: ObservableObject {

    static let shared = SettingsStore()

    @Published var settings: AppSettings {
        didSet { save() }
    }

    private let udKey = "app.settings.v2"

    private init() {
        if let data = UserDefaults.standard.data(forKey: udKey),
           let decoded = try? JSONDecoder().decode(AppSettings.self, from: data) {
            settings = decoded
        } else {
            settings = AppSettings()
        }
    }

    private func save() {
        guard let data = try? JSONEncoder().encode(settings) else { return }
        UserDefaults.standard.set(data, forKey: udKey)
    }
}
