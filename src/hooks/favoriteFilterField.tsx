import { SeriesField } from "../components/Series/Interfaces";
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

  const [favoriteFields, setFavoriteFields] = useState<FavoriteFilterField>(
    () => {
      const storageFields = localStorage.getItem(FAVORITE_FILTER_FIELD) || "{}";
      return JSON.parse(storageFields) as FavoriteFilterField;
    }
  );

  const [initializedSeriesId, setInitializedSeriesId] = useState<number | null>(
    null
  );

  useEffect(() => {
    localStorage.setItem(FAVORITE_FILTER_FIELD, JSON.stringify(favoriteFields));
  }, [favoriteFields, localStorage]);

  if (initializedSeriesId !== seriesId && currentFields.length > 0) {
    const currentIds = currentFields.map((field) => field.id);
    const seriesFavoriteRecord = get(
      favoriteFields,
      seriesId,
      []
    ) as FavoriteRecord[];

    const updatedFavorites = seriesFavoriteRecord.filter((item) =>
      currentIds.includes(item.id)
    );

    if (updatedFavorites.length !== seriesFavoriteRecord.length) {
      setFavoriteFields({
        ...favoriteFields,
        [seriesId]: updatedFavorites,
      });
    }
    setInitializedSeriesId(seriesId);
  }

  const seriesFavoriteRecord = get(
    favoriteFields,
    seriesId,
    []
  ) as FavoriteRecord[];

  const updateFavoritesWithIds = (currentIds: number[]) => {
    const now = moment.now();
    const updatedFavorites = [...seriesFavoriteRecord] as FavoriteRecord[];

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
