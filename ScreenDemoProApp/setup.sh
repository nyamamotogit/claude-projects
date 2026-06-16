#!/usr/bin/env bash
# ScreenDemoPro セットアップスクリプト
# 実行: chmod +x setup.sh && ./setup.sh

set -e

echo "=== ScreenDemoPro Setup ==="

# --- 1. xcodegen のチェック ---
if ! command -v xcodegen &>/dev/null; then
    echo "xcodegen が見つかりません。Homebrew でインストールします..."
    if ! command -v brew &>/dev/null; then
        echo "ERROR: Homebrew が見つかりません。https://brew.sh からインストールしてください。"
        exit 1
    fi
    brew install xcodegen
fi

# --- 2. Xcode プロジェクトの生成 ---
echo "Xcode プロジェクトを生成中..."
xcodegen generate

echo ""
echo "✅ ScreenDemoPro.xcodeproj が生成されました。"
echo ""
echo "次のステップ:"
echo "  1. Xcode で ScreenDemoPro.xcodeproj を開く"
echo "  2. Signing & Capabilities で Development Team を設定"
echo "  3. ⌘R でビルド・実行"
echo ""
echo "初回実行時はメニューバーに アイコンが現れます。"
echo "⌃⌥⌘P を押すとプレゼンモードが起動しますが、"
echo "Accessibility 権限のダイアログが出るのでシステム設定で許可してください。"

# --- 3. Xcode を開く（macOS 標準 bash 3.2 対応: ${,,} は使わない）---
read -p "今すぐ Xcode を開きますか？ [Y/n] " answer
case "$answer" in
    [Nn]|[Nn][Oo]) echo "手動で open ScreenDemoPro.xcodeproj してください。" ;;
    *)             open ScreenDemoPro.xcodeproj ;;
esac
