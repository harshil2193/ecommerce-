// GET all orders (Admin)
// router.get("/all", async (req, res) => {
//   const orders = await Order.find();
//   res.json(orders);
// });

// UPDATE order status
// router.put("/:id", async (req, res) => {
//   const { status } = req.body;

//   const order = await Order.findByIdAndUpdate(
//     req.params.id,
//     { status },
//     // { new: true }
//     { returnDocument: "after" }
//   );

//   res.json(order);
// });