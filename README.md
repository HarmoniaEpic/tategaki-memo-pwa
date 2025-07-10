# 🌐 tategaki-memo-pwa（縦書きメモアプリ）
https://harmoniaepic.github.io/tategaki-memo-pwa/

上記リンク先を開いてご使用下さい。

教育現場向けの縦書きテキストエディタです。マーカー（蛍光ペン）機能付きで、オフラインでも動作する[PWAアプリケーション](https://ja.wikipedia.org/wiki/%E3%83%97%E3%83%AD%E3%82%B0%E3%83%AC%E3%83%83%E3%82%B7%E3%83%96%E3%82%A6%E3%82%A7%E3%83%96%E3%82%A2%E3%83%97%E3%83%AA)です。

# 使い方紹介

## ✨ 主な機能

- **縦書きテキスト編集** - リアルタイムプレビュー付き
- **マーカー機能** - 5色の蛍光ペン＋消しゴムでテキストをハイライト
- **保存・読込機能** 
  - SVG形式での保存・読込（マーカー情報も保持）
  - PNG形式でのエクスポート（透過PNG対応）
- **簡易印刷機能** - A4縦を想定
- **黒板モード** - チョーク風の表示で黒板をシミュレート
- **完全オフライン対応** - PWAとしてインストール可能
- **レスポンシブデザイン** - モバイルから8K解像度まで対応

## 🚀 使い方

1. 上記URLにアクセス
2. テキストエリアに縦書きで入力
3. プレビューをONにしてリアルタイムで確認
4. マーカー機能でテキストをハイライト(プレビューON時)
5. SVGまたはPNGで保存

## 🛠️ 技術仕様

- **対応ブラウザ**: Chrome/Edge/Firefox/Safari（最新版）
- **外部依存**: Google Fonts以外は使用せず
- **セキュリティ**: Content Security Policy (CSP) 実装
- **PWA対応**: Service Workerによる完全オフライン動作

## 📱 アプリとしてインストール

インストールしてオフラインで使えます。ブラウザでアクセス後、「アプリをインストール」ボタンをクリックするか、ブラウザのメニューから「アプリをインストール」を選択してください。

- [Chrome でのインストール方法詳細](https://support.google.com/chrome/answer/9658361?hl=ja)
- [Edge でのインストール方法詳細](https://learn.microsoft.com/ja-jp/microsoft-edge/progressive-web-apps/ux)
- [MDN での PWA 解説](https://developer.mozilla.org/ja/docs/Web/Progressive_web_apps/Guides/Installing)

## 🔒 セキュリティ

v1.8.0より、Content Security Policy (CSP) を実装し、XSS攻撃などからの保護を強化しています。

## 📝 ライセンス

MIT License - 詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 🤝 貢献

Issue報告やPull Requestを歓迎します。

## 👤 作者

HarmoniaEpic

---

Copyright (c) 2025 HarmoniaEpic
