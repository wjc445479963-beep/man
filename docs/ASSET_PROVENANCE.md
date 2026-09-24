# Male_01 动态立绘素材

## 当前使用

- `assets/male-01-portrait.png`：玩家在本任务中提供的原画，保留不覆盖。
- `assets/male-01-blink.png`：基于原画的闭眼表情帧。
- `assets/male-01-smile.png`：基于原画的细微微笑表情帧。

两张新增图于 2026-09-25 使用内置 image_gen 工具编辑生成，未使用 API/CLI 回退。生成文件已复制到仓库 assets，运行时不依赖工作目录外的文件。画面身份、发型、服装、场景、镜头和构图沿用玩家原图。WebGL 只在面部局部区域混合表情，配合轻微身体区域形变；素材本身不包含骨骼、音轨或全身动画。

## 闭眼帧的实际提示词

Use case: identity-preserve. Edit target: the supplied full portrait. Create an animation CLOSED-EYES frame for this exact original fictional adult male character. Change ONLY both eyelids: he softly closes both eyes for a natural blink. Preserve his mouth, expression otherwise, identity, facial geometry, exact head angle, silver-grey hair, black and gold clothing, hands, entire room, lighting, camera, original full-body seated framing and image aspect ratio. Pixel registration to source is essential for in-game overlay animation. Do not redraw or recompose the room. No additional text. Output a single portrait with exactly the same composition as the reference. This is a production game animation frame, not a new illustration.

## 微笑帧的实际提示词

Use case: identity-preserve. Edit target: supplied original fictional adult male portrait. Create a WARM SMILE expression frame of this exact character for game animation. Change ONLY the facial expression: subtle confident genuine closed-mouth smile, corners of the lips slightly raised, warm softened eyes gazing at viewer. NOT a broad grin, no teeth. Keep both eyes open. Preserve exact facial identity, head angle, proportions, exact location of face in the canvas, silver-grey hair, black and gold clothing, hands, entire room, lighting and framing. Keep image aspect ratio and pixel registration to source as exact as possible. All pixels outside the face should remain unchanged. No text, no new objects. This is an aligned expression frame for a visual-novel game, not a new illustration.
