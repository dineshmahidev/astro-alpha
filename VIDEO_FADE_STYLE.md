# Video Fade UI Style

## Location
`app/consumer/index.tsx` — Consumer Home Screen

## Structure
```
videoContainer (25% screen height, relative)
├── SafeAreaView (header overlay, absolute, zIndex:10)
│   └── hamburger (left) + wallet/credits (right)
├── Video (100% width, 100% height of container)
└── Fade slices (14 layers, absolute bottom)
    ├── slice 0: rgba(255,255,255,1)      — bottom, fully white
    ├── slice 1: rgba(255,255,255,0.92)
    ├── slice 2: rgba(255,255,255,0.85)
    ├── slice 3: rgba(255,255,255,0.78)
    ├── slice 4: rgba(255,255,255,0.70)
    ├── slice 5: rgba(255,255,255,0.62)
    ├── slice 6: rgba(255,255,255,0.55)
    ├── slice 7: rgba(255,255,255,0.48)
    ├── slice 8: rgba(255,255,255,0.40)
    ├── slice 9: rgba(255,255,255,0.32)
    ├── slice 10: rgba(255,255,255,0.25)
    ├── slice 11: rgba(255,255,255,0.18)
    ├── slice 12: rgba(255,255,255,0.12)
    └── slice 13: rgba(255,255,255,0.05)  — top, nearly transparent
```

## Styles
```js
videoContainer: {
  width: '100%',
  height: Dimensions.get('window').height * 0.25,
  position: 'relative',
}

videoHeader: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 10,
}

header: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 16,
  paddingVertical: 8,
}

headerSpacer: { flex: 1 }

video: {
  width: '100%',
  height: '100%',
}

fadeSlice: {
  position: 'absolute',
  left: 0,
  right: 0,
}
```

## How It Works
- 14 thin `View` slices (4px each) stacked from bottom to top
- Bottom slice = fully white (`opacity 1`), top slice = nearly transparent (`opacity 0.05`)
- Uses solid `rgba` backgrounds (not `opacity` property) to avoid layering artifacts
- Creates smooth gradient from video → white without `expo-linear-gradient`
- Total fade height: 56px (14 slices × 4px)

## Notes
- Header (hamburger + wallet) overlays the video at top with `zIndex: 10`
- White hamburger lines for visibility on dark video
- Below the video container: rasi/nakshatra bar → 4 service cards → banner → AI/Astrologers → Top Astrologers
