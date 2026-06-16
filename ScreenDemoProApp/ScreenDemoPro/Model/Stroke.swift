import AppKit

struct Stroke {
    let tool:        DrawingTool
    let color:       NSColor
    let lineWidth:   CGFloat
    var points:      [CGPoint]
    var completedAt: Date?       // mouseUp 時刻（nil = 描画中）

    var startPoint: CGPoint { points.first ?? .zero }
    var endPoint:   CGPoint { points.last  ?? .zero }

    // フェードアウト用: 経過秒 / 持続秒 → 0.0〜1.0 の不透明度
    func opacity(fadeAfter: TimeInterval, fadeDuration: TimeInterval) -> CGFloat {
        guard let t = completedAt else { return 1.0 }
        let elapsed = Date().timeIntervalSince(t)
        guard elapsed > fadeAfter else { return 1.0 }
        let progress = (elapsed - fadeAfter) / max(fadeDuration, 0.01)
        return CGFloat(max(0.0, 1.0 - progress))
    }

    var isFullyFaded: Bool {
        completedAt.map { Date().timeIntervalSince($0) > 0 } ?? false
    }

    func path() -> NSBezierPath {
        switch tool {
        case .freehand:   return freehandPath()
        case .rectangle:  return rectanglePath()
        case .arrow:      return arrowPath()
        }
    }

    private func freehandPath() -> NSBezierPath {
        let path = NSBezierPath()
        guard let first = points.first else { return path }
        path.move(to: first)
        for pt in points.dropFirst() { path.line(to: pt) }
        path.lineWidth    = lineWidth
        path.lineCapStyle  = .round
        path.lineJoinStyle = .round
        return path
    }

    private func rectanglePath() -> NSBezierPath {
        let rect = NSRect(
            x: min(startPoint.x, endPoint.x),
            y: min(startPoint.y, endPoint.y),
            width:  abs(endPoint.x - startPoint.x),
            height: abs(endPoint.y - startPoint.y)
        )
        let path = NSBezierPath(rect: rect)
        path.lineWidth = lineWidth
        return path
    }

    private func arrowPath() -> NSBezierPath {
        let path = NSBezierPath()
        path.move(to: startPoint)
        path.line(to: endPoint)
        path.lineWidth    = lineWidth
        path.lineCapStyle = .round

        let dx = endPoint.x - startPoint.x
        let dy = endPoint.y - startPoint.y
        let length = sqrt(dx * dx + dy * dy)
        guard length > 0 else { return path }

        let headLength = min(lineWidth * 4, length * 0.3)
        let headWidth  = headLength * 0.6
        let angle      = atan2(dy, dx)

        let p1 = CGPoint(
            x: endPoint.x - headLength * cos(angle) + headWidth * sin(angle),
            y: endPoint.y - headLength * sin(angle) - headWidth * cos(angle)
        )
        let p2 = CGPoint(
            x: endPoint.x - headLength * cos(angle) - headWidth * sin(angle),
            y: endPoint.y - headLength * sin(angle) + headWidth * cos(angle)
        )
        path.move(to: endPoint); path.line(to: p1)
        path.move(to: endPoint); path.line(to: p2)
        return path
    }
}
