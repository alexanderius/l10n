import { Injectable } from "@angular/core";
import { LocalizationKey } from "../_models/localization-key.model";

export interface MergedObject extends LocalizationKey {
  children?: LocalizationKey[];
}

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  mergeArraysById(arr1: MergedObject[], arr2: MergedObject[]): MergedObject[] {
    const mergedMap = new Map<string, MergedObject>();

    // Helper function to merge children recursively
    const mergeLocalizationKeyren = (children1?: LocalizationKey[], children2?: LocalizationKey[]): LocalizationKey[] => {
      const childrenMap = new Map<string, LocalizationKey>();

      // Add first array's children to the map
      if (children1) {
        children1.forEach(child => {
          childrenMap.set(child.id, { ...child });
        });
      }

      // Merge second array's children
      if (children2) {
        children2.forEach(child => {
          if (childrenMap.has(child.id)) {
            // Merge existing child
            const existingLocalizationKey = childrenMap.get(child.id);
            childrenMap.set(child.id, { ...existingLocalizationKey, ...child });
          } else {
            // Add new child
              childrenMap.set(child.id, { ...child });
            }
          });
      }

      return Array.from(childrenMap.values());
    }

    // Process the first array
    arr1.forEach(item => {
        mergedMap.set(item.id, { ...item });
    });

    // Process the second array
    arr2.forEach(item => {
        if (mergedMap.has(item.id)) {
            const existingItem = mergedMap.get(item.id);
            const mergedItem = { ...existingItem, ...item };

            // Merge children if they exist
            if (existingItem && existingItem.children && item.children) {
                mergedItem.children = mergeLocalizationKeyren(existingItem.children, item.children);
            } else if (item.children) {
                mergedItem.children = item.children;
            }

            mergedMap.set(item.id, mergedItem);
        } else {
            mergedMap.set(item.id, { ...item });
        }
    });

    // Return the merged objects as an array sorted by id
    return Array.from(mergedMap.values()).sort((a, b) => a.id > b.id ? 1 : -1);
  }
}