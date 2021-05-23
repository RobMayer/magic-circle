const changelog = [
    { version: "0.8.0", items: [
        "Radial Array and Vertex Array now use a new way to determine scale factor using spline interpolation (complete with a new UI for it). This is a breaking change.",
        "Fixed a bug with Radial Array toExtents option not distributing scale and color values as expected"
    ]},
    { version: "0.7.2", items: [
        "It'd be nice if you could change the Units on the Canvas, wouldn't it?"
    ]},
    { version: "0.7.1", items: [
        "Fixed a mishandling of an edge case with the gradient input.",
        "Fixed the Square-Root distribution not being selectable."
    ]},
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
