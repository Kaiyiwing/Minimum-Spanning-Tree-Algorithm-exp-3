let canvas, ctx;
let num = 0;
let points = [];
let graph = [];
let graph2 = [];
let color = ['white', 'gray', 'black'];
let time = 0;
let c_width = 600, c_height = 600;

let arrow_color = 'rgba(0,0,256,0.4)';
let draw_point = true;
let draw_line = false;
let do_draw_line = false;
let init_x, init_y, init_point;
let r = 20;
let point_color = ['red', 'green'];
let circle = [];
let is_finish = false;
let has = [];
let has2 = [];
class Point {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.d = -1;
        this.f = -1;
        this.pi = -1;
        // 白灰黑 012
        this.color = 0;
        this.draw_color = 0;
    }

    toString() {
        return '(' + this.id + ': ' + this.x + ', ' + this.y + ', ' + color[this.color] + ',' + this.pi + ')';
    }
}

window.onload = function () {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext('2d');

    clickInit();

    // random_generate();

    $(document).keydown(function (e) {
        if (e.which === 76) {
            draw_point = false; // l
            do_draw_line = true;
        }

        if (e.which === 68) {
            //d
            cal_MGT();

        }
    });
};

function cal_MGT() {
    for (let i = 0; i < points.length; i++) {
        graph2[i] = new LList();
    }

    for (let i = 0; i < graph.length; i++) {
        for (let j = graph[i].head.next; j !== null; j = j.next) {
            if (!is_in_has(i, j.element, has)) {
                has.push(new Node_x(i, j.element));
                // console.log("添加" +i+','+j.element);
                // 添加一个边
                let k = graph2[i].head;
                while (k.next) {
                    k = k.next;
                }
                k.next = new Node(j.element, j.weight);

                // 无向图
                k = graph2[j.element].head;
                while (k.next) {
                    k = k.next;
                }
                k.next = new Node(i, j.weight);

                // 初始化
                for (let i = 0; i < points.length; i++) {
                    points[i].d = -1;
                    points[i].f = -1;
                    points[i].pi = -1;
                    points[i].color = 0;
                    points[i].draw_color = 0;
                }
                circle = [];
                is_finish = false;

                DFS(graph2, points);
                if (circle.length !== 0) {
                    // 形成环了
                    // console.log(circle);
                    let from = 0;
                    let to = 0;
                    let max_weight = 0;
                    let max_from = 0;
                    let max_to = 0;

                    for (let i = 0; i < circle.length; i++) {
                        from = circle[i];
                        to = circle[(i + 1) % circle.length];
                        // console.log(from);
                        // console.log(to);

                        for (let w = graph2[from].head.next; w !== null; w = w.next) {
                            if (w.element === to) {
                                // console.log(w.weight);
                                if (w.weight > max_weight) {
                                    max_from = from;
                                    max_to = to;
                                    max_weight = w.weight;
                                }
                                break;
                            }

                        }
                    }

                    let pre_point = graph2[max_from].head;
                    for (let w = graph2[max_from].head.next; w !== null; w = w.next) {
                        if (w.element === max_to) {
                            pre_point.next = w.next;
                        }
                        pre_point = w;
                    }

                    pre_point = graph2[max_to].head;
                    for (let w = graph2[max_to].head.next; w !== null; w = w.next) {
                        if (w.element === max_from) {
                            pre_point.next = w.next;
                        }
                        pre_point = w;
                    }


                }

            }
        }
    }

    draw(graph2);


}

function random_generate() {
    let point_num = 10;
    let edge_num = 10;
    let x, y, mid_x = c_width / 2, mid_y = c_height / 2;
    let random_range = c_width - 2 * r;

    for (let i = 0; i < point_num; i++) {
        do {
            x = mid_x + random_range * (Math.random() - .5);
            y = mid_y + random_range * (Math.random() - .5);
        } while (!isOverlap(x, y));

        let point_temp = new Point(num, x, y);
        points.push(point_temp);
        graph[num] = new LList();
        drawCircle(ctx, x, y, num, point_color[point_temp.draw_color]);
        num++;
    }

    for (let i = 0; i < edge_num; i++) {
        let edgeCount1 = parseInt(Math.random() * point_num);
        let edgeCount2 = parseInt(Math.random() * point_num);
        const weight = parseInt(Math.random() * 20 + 1);
        while (!is_in_has(edgeCount1,edgeCount2,has2))
        {
            edgeCount1 = parseInt(Math.random() * point_num);
            edgeCount2 = parseInt(Math.random() * point_num);
            has2.push(new Node_x(edgeCount1, edgeCount2));

            let j = graph[edgeCount1].head;
            while (j.next) {
                j = j.next;
            }
            j.next = new Node(edgeCount2,weight);

            // 无向图
            j=graph[edgeCount2].head;
            while (j.next)
            {
                j = j.next;
            }
            j.next = new Node(edgeCount1);
        }
    }

    draw(graph);
}

function isOverlap(x, y) {
    for (let i = 0; i < points.length; i++) {
        if (cal_distance(x, y, points[i].x, points[i].y) < 4 * r) {
            return false;
        }
    }

    return true;
}

function clear() {
    ctx.clearRect(0, 0, c_width, c_height);
    num = 0;
    points = [];
    graph = [];
    time = 0;
    do_draw_line = false;
}

function DFS(graph, points) {
    time = 0;
    for (let i = 0; i < points.length; i++) {
        if (points[i].color === 0 && !is_finish) {
            DFS_VISIT(graph, points, i);
        }
    }
}

function DFS_VISIT(graph, points, i) {
    let u = points[i];
    time += 1;
    u.d = time;
    u.color = 1;

    for (let j = graph[i].head.next; j !== null; j = j.next) {
        if (j.element !== u.pi) {

            if (points[j.element].color === 0) {
                points[j.element].pi = i;
                DFS_VISIT(graph, points, j.element);
            } else if (points[j.element].color === 1) {
                // 是灰色, 即发现环
                let t = i;
                while (points[t].pi !== j.element) {
                    circle.push(t);
                    t = points[t].pi;
                }
                circle.push(t);
                circle.push(j.element);
                is_finish = true;
                break;
            }
        }
    }

    u.color = 2;
    time += 1;
    u.f = time;
}


function clickInit() {
    const c = document.getElementById("canvas");
    c.onmousedown = onClick;
    c.onmousemove = onMove;
    c.onmouseup = onUp;
}

function onClick(e) {
    const x = e.clientX - canvas.getBoundingClientRect().left;
    const y = e.clientY - canvas.getBoundingClientRect().top;

    if (e.shiftKey && draw_point) {

        let point_temp = new Point(num, x, y);
        points.push(point_temp);
        graph[num] = new LList();

        drawCircle(ctx, x, y, num, 'red');

        num++;
    }

    if (do_draw_line) {

        init_x = x;
        init_y = y;
        for (let i = 0; i < points.length; i++) {
            if (cal_distance(x, y, points[i].x, points[i].y) < r) {
                init_point = i;
            }
        }
        // console.log(init_point);
        draw_line = true;
    }

}

function onMove(e) {

}

function onUp(e) {
    if (draw_line) {
        const x = e.clientX - canvas.getBoundingClientRect().left;
        const y = e.clientY - canvas.getBoundingClientRect().top;

        const weight = parseInt(Math.random() * 20 + 1);




        drawArrow(ctx, init_x, init_y, x, y, 0, 0, 3, arrow_color, weight);
        let f_point;

        for (let i = 0; i < points.length; i++) {
            if (cal_distance(x, y, points[i].x, points[i].y) < r) {
                f_point = i;
            }

        }
        // console.log(f_point);

        let j = graph[init_point].head;
        while (j.next) {
            j = j.next;
        }
        j.next = new Node(f_point, weight);

        // 无向图
        j = graph[f_point].head;
        while (j.next) {
            j = j.next;
        }
        j.next = new Node(init_point, weight);


        draw_line = false;
    }

}

function cal_distance(x0, y0, x1, y1) {
    return Math.sqrt(Math.pow((x1 - x0), 2) + Math.pow((y1 - y0), 2));
}

function draw(graph_x) {
    let graph = graph_x;
    ctx.clearRect(0, 0, c_width, c_height);

    for (let i = 0; i < points.length; i++) {
        drawCircle(ctx, points[i].x, points[i].y, points[i].id, point_color[points[i].draw_color]);
    }

    for (let i = 0; i < graph.length; i++) {
        for (let j = graph[i].head.next; j !== null; j = j.next) {
            drawArrow(ctx, points[i].x, points[i].y, points[j.element].x, points[j.element].y, 0, 0, 3, arrow_color, j.weight);
        }
    }

}

function Node_x(from, to) {
    this.from = from;
    this.to = to;
}

function is_in_has(from, to, has) {
    for (let i = 0; i < has.length; i++) {
        if ((has[i].from === from && has[i].to === to) || (has[i].from === to && has[i].to === from)) {
            return true;
        }
    }
    return false;
}

function Node(element, weight = null) {
    this.element = element;
    this.next = null;
    this.weight = weight;
}

function LList() {
    this.head = new Node('head');
    this.find = find;
    this.insert = insert;
    //this.remove = remove;
    this.display = display;
}

function find(item) {
    let currNode = this.head;
    while (currNode.element != item) {
        currNode = currNode.next;
    }
    return currNode;
}

//插入一个元素
function insert(newElement, item) {
    let newNode = new Node(newElement);
    let current = this.find(item);
    newNode.next = current.next;
    current.next = newNode;
}

function display() {
    let currNode = this.head;
    while (!(currNode.next == null)) {
        document.write(currNode.next.element + '&nbsp;');
        currNode = currNode.next;
    }
}

function drawCircle(ctx, x, y, num, color) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 360, false);
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.fill();//画实心圆
    ctx.closePath();

    ctx.font = "18px bold 黑体";
    ctx.fillStyle = "#ff0";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(num, x, y);
}

function drawArrow(ctx, fromX, fromY, toX, toY, theta, headlen, width, color, weight = null) {


    theta = typeof(theta) != 'undefined' ? theta : 30;
    headlen = typeof(theta) != 'undefined' ? headlen : 10;
    width = typeof(width) != 'undefined' ? width : 1;
    color = typeof(color) != 'color' ? color : '#000';

    // 计算各角度和对应的P2,P3坐标
    var angle = Math.atan2(fromY - toY, fromX - toX) * 180 / Math.PI,
        angle1 = (angle + theta) * Math.PI / 180,
        angle2 = (angle - theta) * Math.PI / 180,
        topX = headlen * Math.cos(angle1),
        topY = headlen * Math.sin(angle1),
        botX = headlen * Math.cos(angle2),
        botY = headlen * Math.sin(angle2);

    ctx.save();
    ctx.beginPath();

    let arrowX = fromX - topX,
        arrowY = fromY - topY;

    ctx.moveTo(arrowX, arrowY);
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    arrowX = toX + topX;
    arrowY = toY + topY;
    ctx.moveTo(arrowX, arrowY);
    ctx.lineTo(toX, toY);
    arrowX = toX + botX;
    arrowY = toY + botY;
    ctx.lineTo(arrowX, arrowY);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
    ctx.restore();

    if (weight) {
        ctx.font = "18px bold 黑体";
        // ctx.fillStyle = "black";
        ctx.fillStyle = "rgba(0,0,0,1)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(weight, ((toX + fromX) / 2), ((toY + fromY) / 2));
    }
}


