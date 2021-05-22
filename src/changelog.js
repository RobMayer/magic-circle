const changelog = [
    { version: "0.7.0", items: [
        "Completely overhauled the color interpolation system. Yay Gradients! This may be a breaking change.",
        "Fixed a bug in Radial Array where it was rotated 180-degrees from literally *everything* else. This may also be a breaking change.",
        "Fixed some things the Inner/Outer vs Radius/Spread tab and made it more consistent across different elements"
    ]},
    { version: "0.6.1", items: [
        "Better handled color interpolation on nested arrays"
    ]},
    { version: "0.6.0", items: [
        "Added Color Interpolation for VertexArray and RadialArray"
    ]},
    { version: "0.5.0", items: [
        "Changed how the 'Pen' filter renders for the sake of higher resolutions - re-saving may be necessary.",
        "Added Export to PNG"
    ]},
    { version: "0.4.0", items: [
        "Added Effects Layer with several effect types",
        "Added Recolor Layer",
        "Fixed some fields that were not updating properly"
    ]},
    { version: "0.3.2", items: [
        "Added Changelog (hello!)",
        "SVG gets optimized on export. Still doesn't play well with illustrator, but at least it works in Inkscape?"
    ]}
]

export default changelog;
