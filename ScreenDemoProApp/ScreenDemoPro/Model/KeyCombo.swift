import Carbon.HIToolbox
import CoreGraphics
import AppKit

// MARK: - KeyCombo

/// キーコード＋Carbon モディファイアの組み合わせを保持する値型
struct KeyCombo: Codable, Equatable, Hashable {
    var keyCode:   UInt32   // kVK_ANSI_P など Carbon キーコード
    var modifiers: UInt32   // cmdKey | optionKey | ... (Carbon)

    // MARK: Defaults

    static let `default` = KeyCombo(
        keyCode:   UInt32(kVK_ANSI_P),
        modifiers: UInt32(cmdKey | optionKey | controlKey)
    )

    // フェードON/OFFトグルのデフォルト: ⌃⌥⌘F
    static let defaultFadeToggle = KeyCombo(
        keyCode:   UInt32(kVK_ANSI_F),
        modifiers: UInt32(cmdKey | optionKey | controlKey)
    )

    static let empty = KeyCombo(keyCode: 0, modifiers: 0)

    var isEmpty: Bool { keyCode == 0 && modifiers == 0 }

    // MARK: Display

    var displayString: String {
        var s = modifierDisplayString
        s += keyCodeDisplayString
        return s
    }

    var modifierDisplayString: String {
        var s = ""
        if modifiers & UInt32(controlKey) != 0 { s += "⌃" }
        if modifiers & UInt32(optionKey)  != 0 { s += "⌥" }
        if modifiers & UInt32(shiftKey)   != 0 { s += "⇧" }
        if modifiers & UInt32(cmdKey)     != 0 { s += "⌘" }
        return s
    }

    // MARK: Carbon ↔ CGEvent conversion

    /// Carbon modifier flags → CGEventFlags
    var cgEventFlags: CGEventFlags {
        var flags: CGEventFlags = []
        if modifiers & UInt32(cmdKey)     != 0 { flags.insert(.maskCommand)   }
        if modifiers & UInt32(shiftKey)   != 0 { flags.insert(.maskShift)     }
        if modifiers & UInt32(optionKey)  != 0 { flags.insert(.maskAlternate) }
        if modifiers & UInt32(controlKey) != 0 { flags.insert(.maskControl)   }
        return flags
    }

    /// NSEvent.ModifierFlags → Carbon modifier bits
    static func carbonModifiers(from flags: NSEvent.ModifierFlags) -> UInt32 {
        var m: UInt32 = 0
        if flags.contains(.command) { m |= UInt32(cmdKey)     }
        if flags.contains(.option)  { m |= UInt32(optionKey)  }
        if flags.contains(.shift)   { m |= UInt32(shiftKey)   }
        if flags.contains(.control) { m |= UInt32(controlKey) }
        return m
    }

    // MARK: Key code → display string

    var keyCodeDisplayString: String {
        let map: [Int: String] = [
            kVK_ANSI_A: "A", kVK_ANSI_B: "B", kVK_ANSI_C: "C", kVK_ANSI_D: "D",
            kVK_ANSI_E: "E", kVK_ANSI_F: "F", kVK_ANSI_G: "G", kVK_ANSI_H: "H",
            kVK_ANSI_I: "I", kVK_ANSI_J: "J", kVK_ANSI_K: "K", kVK_ANSI_L: "L",
            kVK_ANSI_M: "M", kVK_ANSI_N: "N", kVK_ANSI_O: "O", kVK_ANSI_P: "P",
            kVK_ANSI_Q: "Q", kVK_ANSI_R: "R", kVK_ANSI_S: "S", kVK_ANSI_T: "T",
            kVK_ANSI_U: "U", kVK_ANSI_V: "V", kVK_ANSI_W: "W", kVK_ANSI_X: "X",
            kVK_ANSI_Y: "Y", kVK_ANSI_Z: "Z",
            kVK_ANSI_0: "0", kVK_ANSI_1: "1", kVK_ANSI_2: "2", kVK_ANSI_3: "3",
            kVK_ANSI_4: "4", kVK_ANSI_5: "5", kVK_ANSI_6: "6", kVK_ANSI_7: "7",
            kVK_ANSI_8: "8", kVK_ANSI_9: "9",
            kVK_F1: "F1",  kVK_F2: "F2",  kVK_F3: "F3",  kVK_F4: "F4",
            kVK_F5: "F5",  kVK_F6: "F6",  kVK_F7: "F7",  kVK_F8: "F8",
            kVK_F9: "F9",  kVK_F10: "F10", kVK_F11: "F11", kVK_F12: "F12",
            kVK_Space:      "Space",
            kVK_Return:     "↩",
            kVK_Tab:        "⇥",
            kVK_Delete:     "⌫",
            kVK_Escape:     "⎋",
            kVK_UpArrow:    "↑",
            kVK_DownArrow:  "↓",
            kVK_LeftArrow:  "←",
            kVK_RightArrow: "→",
            kVK_ANSI_Minus:          "-",
            kVK_ANSI_Equal:          "=",
            kVK_ANSI_LeftBracket:    "[",
            kVK_ANSI_RightBracket:   "]",
            kVK_ANSI_Backslash:      "\\",
            kVK_ANSI_Semicolon:      ";",
            kVK_ANSI_Quote:          "'",
            kVK_ANSI_Comma:          ",",
            kVK_ANSI_Period:         ".",
            kVK_ANSI_Slash:          "/",
            kVK_ANSI_Grave:          "`",
        ]
        return map[Int(keyCode)] ?? "(\(keyCode))"
    }
}

// MARK: - FourCharCode helper

func fourCC(_ s: String) -> OSType {
    var result: OSType = 0
    for c in s.utf16.prefix(4) { result = (result << 8) | OSType(c) }
    return result
}
