let main = () => {
    let now = new Date()
    let span = 60 // seconds
    let svg = prepareSvg("#chart", "chart-flow")
    let scale = mkTimeScale(svg, now, span)
    let axis = mkTimeAxis(scale)
    renderTimeAxis(svg, axis)
    window.setInterval(() => {
        let update = () => updateTimeAxis(span)
        requestAnimationFrame(update)
    }, 100)
}

let prepareSvg = (containerSelector, name) => {
    return d3.select(containerSelector)
        .append("svg")
        .attr("id", name)
}

let updateTimeAxis = (span) => {
    let svg = d3.select("svg")
    let now = new Date()
    let scale = mkTimeScale(svg, now, span)
    let axis = mkTimeAxis(scale)
    let t = d3.transition()
        .duration(100)
        .ease(d3.easeLinear)
    svg.select(".time").transition(t).call(axis)
}

let renderTimeAxis = (svg, axis) => {
    let bbox = svg.node().getBoundingClientRect()
    let y = bbox.height / 2
    svg.append("g")
        .attr("class", "time axis")
        .attr("transform", "translate(" + 0 + ", " + y + ")")
        .call(axis)
}

let mkTimeScale = (svg, currentTime, spanInterval) => {
    let bbox = svg.node().getBoundingClientRect()
    let from = new Date(currentTime.getTime() - spanInterval * 1000)
    let to = currentTime
    let scale = d3.scaleTime().domain([from, to]).range([0, bbox.width])
    return scale
}

let mkTimeAxis = (scale) => {
    return d3.axisBottom(scale).tickSizeOuter(0)
}

main()
