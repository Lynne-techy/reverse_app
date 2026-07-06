import { useState } from "react";
import "./FavoritePage.css";

interface FavoriteItem {
  id: number;
  title: string;
  reference: string;
  description: string;
}

function FavoritePage() {
  // ===========================
  // State
  // ===========================

  const [favorites] = useState<FavoriteItem[]>([
    {
      id: 1,
      title: "Love",
      reference: "John 3:16",
      description: "For God so loved the world..."
    },
    {
      id: 2,
      title: "Strength",
      reference: "Philippians 4:13",
      description: "I can do all things through Christ..."
    },
    {
      id: 3,
      title: "Peace",
      reference: "Isaiah 26:3",
      description: "You will keep in perfect peace..."
    }
  ]);

  // ===========================
  // Event Handlers
  // ===========================

  const handleOpen = (item: FavoriteItem) => {
    console.log("Opening:", item);
  };

  const handleRemove = (item: FavoriteItem) => {
    console.log("Removing:", item);
  };

  // ===========================
  // JSX
  // ===========================

  return (
    <div>

      <h1>Favorite Scriptures</h1>

      <p>
        Your saved Bible verses and passages.
      </p>

      <hr />

      {favorites.length === 0 ? (

        <p>No favorites yet.</p>

      ) : (

        favorites.map((item) => (

          <div key={item.id}>

            <h3>{item.title}</h3>

            <p>
              <strong>{item.reference}</strong>
            </p>

            <p>{item.description}</p>

            <button
              onClick={() => handleOpen(item)}
            >
              Open
            </button>

            <button
              onClick={() => handleRemove(item)}
            >
              Remove
            </button>

            <hr />

          </div>

        ))

      )}

    </div>
  );
}

export default FavoritePage;
