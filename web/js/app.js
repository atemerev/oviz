function main() {
    const width = 500;
    const height = 200;

    const topScale = createVolumeScale(1, 100000, 0, 100);
    const bottomScale = createVolumeScale(100000, 1, 0, 100);

    const svg = prepareSvg("btc-usd-bitmex", width, height + 50);

    const bidVolumeAxis = mkAxis(topScale).ticks(4).tickFormat(d3.format(",d"));
    const offerVolumeAxis = mkAxis(bottomScale).ticks(4).tickFormat(d3.format(",d"));

    svg.append("g")
        .attr("class", "y1 axis").attr("transform", "translate(" + (width - 50) + ", " + 10 + ")")
        .call(bidVolumeAxis);

    svg.append("g")
        .attr("class", "y2 axis").attr("transform", "translate(" + (width - 50) + ", " + (height / 2 + 10) + ")")
        .call(offerVolumeAxis);

    removeZeroTicks(svg);
}

function prepareSvg(id, width, height) {
    return d3.select("#" + id)
        .attr("width", width)
        .attr("height", height);
}

function mkAxis(scale) {
    return d3.axisRight(scale).tickSizeOuter(0);
}

function createVolumeScale(minVolume, maxVolume, minScale, maxScale) {
    return d3.scaleLog().domain([minVolume, maxVolume]).range([maxScale, minScale]);
}

function removeZeroTicks(svg) {
    svg.selectAll(".tick")
        .filter(function (d) { return d === 1;  })
        .remove();
}

main();