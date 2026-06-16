import Foundation

enum DrawingTool: String, Codable, CaseIterable {
    case freehand
    case rectangle
    case arrow

    var displayName: String {
        switch self {
        case .freehand:  return "フリーハンド"
        case .rectangle: return "矩形"
        case .arrow:     return "矢印"
        }
    }

    var iconName: String {
        switch self {
        case .freehand:  return "scribble"
        case .rectangle: return "rectangle"
        case .arrow:     return "arrow.up.right"
        }
    }
}
