import { SeriesField } from "@renderer/components/Series/Interfaces";
import { get } from "lodash";
import moment from "moment";
import { useState, useEffect } from "react";

const FAVORITE_FILTER_FIELD = "FAVORITE_FILTER_FIELD";

export interface FavoriteRecord {
  id: number;
  lastUsed: number;
}

interface FavoriteFilterField {
  [key: number]: FavoriteRecord[];
}

export const useFavoriteFilterField = (
  seriesId: number,
  currentFields: SeriesField[]
) => {
  const { localStorage } = window;

  // 從localStorage中獲取數據並設為內部狀態
  const [favoriteFields, setFavoriteFields] = useState<FavoriteFilterField>(
    () => {
      const storageFields = localStorage.getItem(FAVORITE_FILTER_FIELD) || "{}";
      return JSON.parse(storageFields);
    }
  );

  // 將favoriteFields保存到localStorage
  useEffect(() => {
    localStorage.setItem(FAVORITE_FILTER_FIELD, JSON.stringify(favoriteFields));
  }, [favoriteFields]);

  useEffect(() => {
    // 初次載入時，檢查該欄位是否已被刪除
    const currentIds = currentFields.map((field) => field.id);
    const seriesFavoriteRecord = get(
      favoriteFields,
      seriesId,
      []
    ) as FavoriteRecord[];

    const updatedFavorites = seriesFavoriteRecord.filter((item) =>
      currentIds.includes(item.id)
    );

    setFavoriteFields({
      ...favoriteFields,
      [seriesId]: updatedFavorites,
    });
  }, [seriesId, currentFields]);

  const seriesFavoriteRecord = get(
    favoriteFields,
    seriesId,
    []
  ) as FavoriteRecord[];

  const updateFavoritesWithIds = (currentIds: number[]) => {
    const now = moment.now();
    const updatedFavorites = [...seriesFavoriteRecord] as FavoriteRecord[];

    // 將currentIds中的id與favoriteFields中的id進行比較
    // 如果favoriteFields中的id在currentIds中，則將其lastUsed更新為now
    // 如果favoriteFields中的id不在currentIds中，則將其刪除
    currentIds.forEach((id) => {
      const existIndex = updatedFavorites.findIndex((item) => item.id === id);

      if (existIndex !== -1) {
        updatedFavorites[existIndex].lastUsed = now;
      } else {
        updatedFavorites.push({
          id,
          lastUsed: now,
        });
      }
    });

    setFavoriteFields({
      ...favoriteFields,
      [seriesId]: updatedFavorites,
    });
  };

  return { seriesFavoriteRecord, updateFavoritesWithIds };
};
