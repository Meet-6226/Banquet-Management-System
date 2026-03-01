import InventoryItem from '@/models/InventoryItem';
import { IMenuItem } from '@/models/Event';

/**
 * Deduct inventory items based on menu items and guest count.
 * Throws an error if any item has insufficient stock.
 */
export async function deductInventory(
    branchId: string,
    menuItems: IMenuItem[],
    guestCount: number
): Promise<{ deducted: { name: string; deducted: number; remaining: number }[] }> {
    const deducted: { name: string; deducted: number; remaining: number }[] = [];

    for (const item of menuItems) {
        const totalRequired = item.qtyPerGuest * guestCount;

        const inventoryItem = await InventoryItem.findOne({
            branchId,
            name: { $regex: new RegExp(`^${item.name}$`, 'i') },
        });

        if (!inventoryItem) {
            throw new Error(`Inventory item "${item.name}" not found for this branch`);
        }

        if (inventoryItem.quantity < totalRequired) {
            throw new Error(
                `Insufficient stock for "${item.name}": need ${totalRequired} ${inventoryItem.unit}, available ${inventoryItem.quantity} ${inventoryItem.unit}`
            );
        }

        inventoryItem.quantity -= totalRequired;
        await inventoryItem.save();

        deducted.push({
            name: item.name,
            deducted: totalRequired,
            remaining: inventoryItem.quantity,
        });
    }

    return { deducted };
}
