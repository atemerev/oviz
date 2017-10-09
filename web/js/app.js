function main() {
    const book = getSampleOrderBook();

    const width = 500;
    const height = 200;

    const RIGHT_AXIS_WIDTH = 70;
    const LEFT_MARGIN = 10;

    const topScale = mkVolumeScale(1, 100000, 0, height / 2);
    const bottomScale = mkVolumeScale(100000, 1, 0, height / 2);
    const priceScale = mkPriceDeltaScale(book, width - RIGHT_AXIS_WIDTH, 5);

    const svg = prepareSvg("btc-usd-bitmex", width, height + 50);

    const spread = getSpread(book);
    const priceAxisOffset = priceScale(spread) - priceScale(0);

    renderPriceAxis(svg, priceScale, LEFT_MARGIN, height / 2 + 10);
    renderVolumeAxis(svg, "offer", topScale, 4, width - RIGHT_AXIS_WIDTH + LEFT_MARGIN - priceAxisOffset, 10);
    renderVolumeAxis(svg, "bid", bottomScale, 4, width - RIGHT_AXIS_WIDTH + LEFT_MARGIN - priceAxisOffset, height / 2 + 10);

    const midPrice = calculateMidPrice(book);
    const fmtMidPrice = d3.format(",r")(midPrice);
    renderText(svg, fmtMidPrice, "mid", priceScale(0) + LEFT_MARGIN + 8, height / 2 + 15);
}

function prepareSvg(id, width, height) {
    return d3.select("#" + id)
        .attr("width", width)
        .attr("height", height);
}

function mkVolumeAxis(scale) {
    return d3.axisRight(scale).tickSizeOuter(0);
}

function mkPriceAxis(scale) {
    return d3.axisBottom(scale).tickSizeOuter(0);
}

function renderVolumeAxis(svg, name, scale, ticks, x, y) {
    const volumeAxis = mkVolumeAxis(scale).ticks(ticks).tickFormat(d3.format(",d"));
    svg.append("g")
        .attr("class", name + " axis").attr("transform", "translate(" + x + ", " + y + ")")
        .call(volumeAxis);
    removeZeroTicks(svg, 1);
}

function renderPriceAxis(svg, scale, x, y) {
    const priceAxis = mkPriceAxis(scale);
    const g = svg.append("g")
        .attr("class", "price axis").attr("transform", "translate(" + x + ", " + y + ")")
        .call(priceAxis);
    const x0 = scale(0);
    g.append("line").attr("x1", x0 + 1.5).attr("y1", -6).attr("x2", x0 + 1.5).attr("y2", 7).attr("class", "tamp");
    removeZeroTicks(svg, 0);
}

function renderText(svg, text, cssClass, x, y) {
    const g = svg.append("g").attr("class", cssClass).attr("transform", "translate(" + x + ", " + y + ")");
    g.append("text").text(text);
}

function mkVolumeScale(minVolume, maxVolume, minScale, maxScale) {
    return d3.scaleLog().domain([minVolume, maxVolume]).range([maxScale, minScale]);
}

function mkPriceDeltaScale(book, width, depth) {
    // const numBids = book.bids.length;
    // const numOffers = book.offers.length;
    // const mid = calculateMidPrice(book);
    // const worstBid = book.bids[numBids - 1][1];
    // const worstOffer = book.offers[numOffers - 1][1];
    // const bidRange = worstBid - mid;
    // const offerRange = mid - worstOffer;
    // const span = Math.min(bidRange, offerRange);
    const domain = [-depth, 0];
    const range = [0, width];
    return d3.scaleLinear().domain(domain).range(range);
}

function removeZeroTicks(svg, val) {
    svg.selectAll(".tick")
        .filter(function (d) { return d === val;  })
        .remove();
}

function calculateMidPrice(book) {
    if (book.bids.length === 0 || book.offers.length === 0) {
        return NaN;
    } else {
        const bestBid = book.bids[0][1];
        const bestOffer = book.offers[0][1];
        return (bestBid + bestOffer) / 2;
    }
}

function getSampleOrderBook() {
    return {
        "symbol": "XBTC/USD",
        "exchange": "BitMEX",
        "time": 1507463045741,
        "bids": [[39964.0,4463.5],[4600.0,4463.2],[10967.0,4463.1],[12252.0,4463],[2050.0,4462.5],[8000.0,4462.4],[8526.0,4462.1],[13010.0,4462],[40.0,4461.9],[1786.0,4461.7],[90.0,4461.6],[2000.0,4461.5],[8678.0,4461.4],[46.0,4461.2],[7926.0,4461.1],[10700.0,4461],[1697.0,4460.9],[16050.0,4460.7],[12756.0,4460.6],[32000.0,4460.5],[1046.0,4460.3],[8926.0,4460.2],[7000.0,4460.1],[13200.0,4460],[6191.0,4459.9]],
        "offers": [[12759.0,4463.6],[7529.0,4463.7],[123.0,4463.9],[14200.0,4464],[8300.0,4464.1],[8000.0,4464.8],[4000.0,4465],[8400.0,4465.1],[953.0,4465.4],[8190.0,4465.5],[47.0,4465.6],[4010.0,4465.8],[4246.0,4465.9],[9000.0,4466],[10.0,4466.4],[10000.0,4466.5],[46.0,4466.8],[1600.0,4467],[2000.0,4467.1],[4046.0,4467.2],[7600.0,4467.3],[5840.0,4467.5],[2463.0,4467.6],[9100.0,4467.8],[1342.0,4467.9]]
    }
}

function getSpread(book) {
    return book.offers[0][1] - book.bids[0][1];
}

main();