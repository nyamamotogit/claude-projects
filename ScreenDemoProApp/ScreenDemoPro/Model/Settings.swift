import AppKit
import SwiftUI

// MARK: - CodableColor

struct CodableColor: Codable, Equatable {
    var red:   Double
    var green: Double
    var blue:  Double
    var alpha: Double

    init(_ color: NSColor) {
        let c = color.usingColorSpace(.sRGB) ?? color
        red   = Double(c.redComponent)
        green = Double(c.greenComponent)
        blue  = Double(c.blueComponent)
        alpha = Double(c.alphaComponent)
    }

    var nsColor: NSColor {
        NSColor(srgbRed: red, green: green, blue: blue, alpha: alpha)
    }

    var swiftUIColor: Color { Color(nsColor) }

    static let defaultMagenta = CodableColor(NSColor(srgbRed: 1.0, green: 0.0, blue: 0.6, alpha: 1.0))
    static let defaultRed     = CodableColor(.systemRed)
    static let defaultBlue    = CodableColor(.systemBlue)
    static let defaultGreen   = CodableColor(.systemGreen)
    static let defaultOrange  = CodableColor(.systemOrange)
    static let defaultYellow  = CodableColor(.systemYellow)
}

// MARK: - AppSettings

struct AppSettings: Codable, Equatable {
    var toggleHotKey:       KeyCombo     = .default
    var strokeColor:        CodableColor = .defaultMagenta
    var strokeWidth:        Double       = 4.0
    var defaultTool:        DrawingTool  = .freehand
    var fadeEnabled:        Bool         = false
    var fadeDelay:          Double       = 2.0   // 描画完了からフェード開始までの秒数
    var fadeDuration:       Double       = 1.0   // フェードにかかる秒数
    var launchAtLogin:      Bool         = false
}
