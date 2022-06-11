#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 构建
npm run build:code

# 复制文件
cp public/* dist/

# 进入生成的文件夹
cd dist

if [ -n "$GITHUB_TOKEN" ]; then
  msg='来自github actions的自动部署'
  githubUrl=https://GustinLau:${GITHUB_TOKEN}@github.com/GustinLau/watermark.git
  git config --global user.name "GustinLau"
  git config --global user.email "gustinlau@gmail.com"
fi

git init
git add -A
git commit -m "${msg}"

if [ -n "$GITHUB_TOKEN" ]; then
  # 推送到github pages分支
  git push -f $githubUrl master:pages
fi

cd -
rm -rf dist
