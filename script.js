const API = "http://127.0.0.1:8080/api";

async function loadDashboard() {
    try {
        const zones = await fetch(API + "/zones").then(res => res.json());
        const bins = await fetch(API + "/bins").then(res => res.json());
        const stock = await fetch(API + "/stock").then(res => res.json());
        const orders = await fetch(API + "/orders").then(res => res.json());

        document.getElementById("zoneCount").textContent = zones.length;
        document.getElementById("binCount").textContent = bins.length;
        document.getElementById("stockCount").textContent = stock.length;
        document.getElementById("orderCount").textContent = orders.length;
    } catch (error) {
        console.error("Dashboard error:", error);
    }
}

async function createZone() {
    const name = document.getElementById("zoneName").value;
    const type = document.getElementById("zoneType").value;

    if (name.trim() === "") {
        alert("Please enter a zone name.");
        return;
    }

    try {
        const response = await fetch(API + "/zones", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                type: type
            })
        });

        if (!response.ok) {
            const error = await response.json();
            alert(error.message || "Failed to create zone");
            return;
        }

        alert("Zone created successfully!");

        document.getElementById("zoneName").value = "";

        loadZones();
        loadDashboard();
    } catch (error) {
        console.error("Create zone error:", error);
        alert("Could not connect to backend.");
    }
}

async function loadZones() {
    try {
        const response = await fetch(API + "/zones");
        const zones = await response.json();

        const table = document.getElementById("zoneTable");

        table.innerHTML = "";

        zones.forEach(zone => {
            table.innerHTML += `
                <tr>
                    <td>${zone.id}</td>
                    <td>${zone.name}</td>
                    <td>${zone.type}</td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Load zones error:", error);
    }
}

async function createBin() {
    const binCode = document.getElementById("binCode").value;
    const capacity = Number(document.getElementById("binCapacity").value);
    const zoneId = Number(document.getElementById("binZoneId").value);

    if (binCode.trim() === "") {
        alert("Please enter a bin code.");
        return;
    }

    if (capacity <= 0) {
        alert("Capacity must be greater than 0.");
        return;
    }

    if (zoneId <= 0) {
        alert("Please enter a valid Zone ID.");
        return;
    }

    try {
        const response = await fetch(API + "/bins", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                binCode: binCode,
                capacity: capacity,
                zoneId: zoneId
            })
        });

        if (!response.ok) {
            const error = await response.json();
            alert(error.message || "Failed to create bin");
            return;
        }

        alert("Bin created successfully!");

        document.getElementById("binCode").value = "";
        document.getElementById("binCapacity").value = "";
        document.getElementById("binZoneId").value = "";

        loadBins();
        loadDashboard();
    } catch (error) {
        console.error("Create bin error:", error);
        alert("Could not connect to backend.");
    }
}

async function loadBins() {
    try {
        const response = await fetch(API + "/bins");
        const bins = await response.json();

        const table = document.getElementById("binTable");

        table.innerHTML = "";

        bins.forEach(bin => {
            table.innerHTML += `
                <tr>
                    <td>${bin.id}</td>
                    <td>${bin.binCode}</td>
                    <td>${bin.capacity}</td>
                    <td>${bin.occupied}</td>
                    <td>${bin.zone.name}</td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Load bins error:", error);
    }
}

async function createStock() {
    const itemName = document.getElementById("itemName").value;
    const velocity = document.getElementById("velocity").value;
    const quantity = Number(document.getElementById("stockQuantity").value);

    if (itemName.trim() === "") {
        alert("Please enter an item name.");
        return;
    }

    if (quantity <= 0) {
        alert("Quantity must be greater than 0.");
        return;
    }

    try {
        const response = await fetch(API + "/stock/assign", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                itemName: itemName,
                velocity: velocity,
                quantity: quantity
            })
        });

        if (!response.ok) {
            const error = await response.json();
            alert(error.message || "Failed to create stock");
            return;
        }

        alert("Stock created successfully!");

        document.getElementById("itemName").value = "";
        document.getElementById("stockQuantity").value = "";

        loadStock();
        loadBins();
        loadDashboard();
    } catch (error) {
        console.error("Create stock error:", error);
        alert("Could not connect to backend.");
    }
}

async function pickStock(stockId) {
    const quantity = prompt("Enter quantity to pick:");

    if (quantity === null) {
        return;
    }

    const pickQuantity = Number(quantity);

    if (pickQuantity <= 0) {
        alert("Quantity must be greater than 0.");
        return;
    }

    try {
        const response = await fetch(
            API + "/stock/" + stockId + "/pick?quantity=" + pickQuantity,
            {
                method: "PUT"
            }
        );

        if (!response.ok) {
            const error = await response.json();
            alert(error.message || "Failed to pick stock");
            return;
        }

        alert("Stock picked successfully!");

        loadStock();
        loadBins();
        loadReports();
        loadDashboard();
    } catch (error) {
        console.error("Pick stock error:", error);
        alert("Could not connect to backend.");
    }
}

async function loadStock() {
    try {
        const response = await fetch(API + "/stock");
        const stock = await response.json();

        const table = document.getElementById("stockTable");

        table.innerHTML = "";

        stock.forEach(item => {
            table.innerHTML += `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.itemName}</td>
                    <td>${item.velocity}</td>
                    <td>${item.quantity}</td>
                    <td>${item.bin.binCode}</td>
                    <td>
                        <button onclick="pickStock(${item.id})">
                            Pick Stock
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Load stock error:", error);
    }
}

async function createOrder() {
    const itemName = document.getElementById("orderItemName").value;
    const quantity = Number(document.getElementById("orderQuantity").value);

    if (itemName.trim() === "") {
        alert("Please enter an item name.");
        return;
    }

    if (quantity <= 0) {
        alert("Quantity must be greater than 0.");
        return;
    }

    try {
        const response = await fetch(API + "/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                itemName: itemName,
                quantity: quantity
            })
        });

        if (!response.ok) {
            const error = await response.json();
            alert(error.message || "Failed to create order");
            return;
        }

        alert("Order created successfully!");

        document.getElementById("orderItemName").value = "";
        document.getElementById("orderQuantity").value = "";

        loadOrders();
        loadDashboard();
    } catch (error) {
        console.error("Create order error:", error);
        alert("Could not connect to backend.");
    }
}

async function generatePickList(orderId) {
    try {
        const response = await fetch(
            API + "/orders/" + orderId + "/pick-list",
            {
                method: "POST"
            }
        );

        if (!response.ok) {
            const error = await response.json();
            alert(error.message || "Failed to generate pick list");
            return;
        }

        const pickList = await response.json();

        const table = document.getElementById("pickListTable");

        table.innerHTML += `
            <tr>
                <td>${pickList.orderId}</td>
                <td>${pickList.itemName}</td>
                <td>${pickList.binCode}</td>
                <td>${pickList.zone}</td>
                <td>${pickList.quantity}</td>
            </tr>
        `;

        alert("Pick list generated successfully!");
    } catch (error) {
        console.error("Pick list error:", error);
        alert("Could not connect to backend.");
    }
}

async function loadOrders() {
    try {
        const response = await fetch(API + "/orders");
        const orders = await response.json();

        const table = document.getElementById("orderTable");

        table.innerHTML = "";

        orders.forEach(order => {
            table.innerHTML += `
                <tr>
                    <td>${order.id}</td>
                    <td>${order.itemName}</td>
                    <td>${order.quantity}</td>
                    <td>
                        <button onclick="generatePickList(${order.id})">
                            Generate Pick List
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Load orders error:", error);
    }
}

async function loadReports() {
    try {
        const utilizationResponse =
            await fetch(API + "/reports/bin-utilization");

        const utilization = await utilizationResponse.json();

        const utilizationTable =
            document.getElementById("utilizationTable");

        utilizationTable.innerHTML = "";

        utilization.forEach(item => {
            utilizationTable.innerHTML += `
                <tr>
                    <td>${item.binCode}</td>
                    <td>${item.zone}</td>
                    <td>${item.capacity}</td>
                    <td>${item.occupied}</td>
                    <td>${item.utilizationPercentage}%</td>
                </tr>
            `;
        });

        const velocityResponse =
            await fetch(API + "/reports/item-velocity");

        const velocity = await velocityResponse.json();

        const velocityTable =
            document.getElementById("velocityTable");

        velocityTable.innerHTML = "";

        velocity.forEach(item => {
            velocityTable.innerHTML += `
                <tr>
                    <td>${item.itemName}</td>
                    <td>${item.velocity}</td>
                    <td>${item.quantity}</td>
                    <td>${item.binCode}</td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Load reports error:", error);
    }
}

loadDashboard();