import cron from "node-cron";
import axios from "axios";
import { updateInventory } from "../services/inventoryService";

cron.schedule("0 * * * *", async () => {
  try {
    const response = await axios.get(
      "http://localhost:3000/api/warehouse/inventory/data"
    );
    console.log(response);
    const responseData = response.data;
    const productId = responseData.productId;
    const orderId = responseData.orderId;
    try {
      await updateInventory(productId, orderId);
    } catch (err) {
      console.error("Error while updating inventory");
    }
  } catch (error) {
    console.log("Error while syncing inventory data");
  }
});
