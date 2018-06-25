let conf = {
    timeSpanS: 60,
    timeResMs: 100,
    timeAxisHeight: 50,
    symbol: "XBTUSD",
    bucketMs: 5,
    barWidth: 2,
    barMargin: 10
}

let trades = []

let main = () => {
    let now = new Date()
    let span = conf.timeSpanS // seconds
    let svg = prepareSvg("#chart", "chart-flow")
    let bbox = svg.node().getBoundingClientRect()
    let timeScale = mkTimeScale(svg, now, span)
    let amountScale = mkAmountScale(svg)
    let axis = mkTimeAxis(timeScale)
    renderTimeAxis(svg, axis)
    renderDivider(svg)
    let buyG = svg.append("g").attr("class", "buys").attr("transform", "translate(" + 0 + "," + (bbox.height - conf.timeAxisHeight) / 2 + ")")
    window.setInterval(() => {
        let update = () => {
            let scale = updateTimeAxis(span)
            drawTrades(buyG, trades, scale, amountScale)
        }
        requestAnimationFrame(update)
    }, conf.timeResMs)
    connectWs((data) => {
        onWsMessage(JSON.parse(data))
    })
}

let drawTrades = (g, trades, timeScale, amountScale) => {
    let t = d3.transition()
        .duration(conf.timeResMs)
        .ease(d3.easeLinear)
    let w = conf.barWidth
    let bars = g.selectAll(".buy")
        .data(trades, (t) => t[0])

    bars.exit().remove()

    bars.enter()
        .append("rect")
        .attr("class", "buy")
        .attr("y", (d) => d[1] > 0 ? -amountScale(Math.abs(d[1])) : 0)
        .attr("width", w)
        .attr("height", (d) => {
            console.log(amountScale(d[1]))
            return amountScale(Math.abs(d[1]))
        })
        .attr("x", (d) => {
            // console.log(d[0]);
            return timeScale(new Date(d[0])) - w / 2
        })
        .merge(bars)
        .transition(t)
        .attr("x", (d) => {
            return timeScale(new Date(d[0])) - w / 2
        })
}

let onWsMessage = (data) => {
    if (data.table === "trade") {
        updateTrades(data)
    }
}

let isNewBucket = (data, item, bucketMs) => {
    if (data.length === 0) {
        return true
    } else {
        let last = data[data.length - 1]
        let sameSide = Math.sign(last[1]) === Math.sign(item[1])
        let sameBucket = item[0] - last[0] < bucketMs
        return !(sameSide && sameBucket)
    }
}

let connectWs = (callback) => {
    let ws = new WebSocket("wss://www.bitmex.com/realtime?subscribe=trade")
    ws.onopen = (conn) => {
        console.log("WS connected")
    }
    ws.onmessage = (e) => {
        callback(e.data)
    }
    ws.onclose = (e) => {
        console.log("WS disconnected")
    }
    ws.onerror = (e) => {
        console.log(e)
    }
}

let prepareSvg = (containerSelector, name) => {
    return d3.select(containerSelector)
        .append("svg")
        .attr("id", name)
}

let updateTrades = (data) => {
    for (let item of data.data) {
        if (item.symbol === conf.symbol) {
            let timeSpan = conf.timeSpanS * 1000
            let side = item.side
            let amount = side === "Buy" ? item.size : -item.size
            let price = item.price
            let ts = new Date(item.timestamp).getTime()
            let newItem = [ts, amount, price]
            if (isNewBucket(trades, newItem, conf.bucketMs)) {
                trades.push([ts, amount, price])
            } else {
                let last = trades[trades.length - 1]
                let lastPrice = last[2]
                let lastAmount = last[1]
                let newAmount = newItem[1]
                let newPrice = newItem[2]
                let vwap = (lastPrice * lastAmount + newPrice * newAmount) / (lastAmount + newAmount)
                let amount = lastAmount + newAmount
                last[1] = amount
                last[2] = vwap
            }
            while (trades[trades.length - 1][0] - trades[0][0] > timeSpan) {
                trades.shift()
            }
        }
    }
}

let updateTimeAxis = (span) => {
    let svg = d3.select("svg")
    let now = new Date()
    let scale = mkTimeScale(svg, now, span)
    let axis = mkTimeAxis(scale)
    let t = d3.transition()
        .duration(conf.timeResMs)
        .ease(d3.easeLinear)
    svg.select(".time").transition(t).call(axis)
    return scale
}

let renderDivider = (svg) => {
    let bbox = svg.node().getBoundingClientRect()
    let y = (bbox.height - conf.timeAxisHeight) / 2
    svg.append("g")
        .attr("class", "divider")
        .attr("transform", "translate(" + 0 + ", " + y + ")")
        .append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", bbox.width)
        .attr("y2", 0)
}

let renderTimeAxis = (svg, axis) => {
    let bbox = svg.node().getBoundingClientRect()
    let y = bbox.height - conf.timeAxisHeight
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

let mkAmountScale = (svg) => {
    let bbox = svg.node().getBoundingClientRect()
    let vSpan = (bbox.height - conf.timeAxisHeight) / 2
    return d3.scaleLog().clamp(true).domain([1, 200000]).range([0, vSpan - conf.barMargin])
}

let mkTimeAxis = (scale) => {
    return d3.axisBottom(scale).tickSizeOuter(0)
}

main()
