import { useState } from "react";
import "./WritingPage.css";

function WritingPage() {

  // ===========================
  // Current State
  // ===========================

  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  // ===========================
  // Future State
  // ===========================

  // Scripture Range
  const [range, setRange] = useState("");

  // Language
  const [language, setLanguage] = useState("");

  // Key Verse
  const [keyVerse, setKeyVerse] = useState("");

  // QT Notes
  const [qt, setQt] = useState("");

  // OCR / AI Result
  const [result, setResult] = useState("");

  // ===========================
  // Event Handlers
  // ===========================

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {

    if (!event.target.files) return;

    setSelectedImage(event.target.files[0]);

  };

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {

    event.preventDefault();

    if (!selectedImage) {
      alert("Please upload an image.");
      return;
    }

    console.log("Submitting Writing Record");

    console.log({
      range,
      language,
      selectedImage,
      keyVerse,
      qt,
      result,
    });

    // TODO:
    // Send data to backend

  };

  // ===========================
  // JSX
  // ===========================

  return (

    <div>

      <h1>Scripture Writing</h1>

      <form onSubmit={handleSubmit}>

        {/* ===========================
            Future Feature
            Scripture Range
        =========================== */}

        <div>

          <label>Scripture Range</label>

          <input
            type="text"
            placeholder="Coming Soon"
            value={range}
            onChange={(e) => setRange(e.target.value)}
            disabled
          />

        </div>

        <br />

        {/* ===========================
            Future Feature
            Language
        =========================== */}

        <div>

          <label>Language</label>

          <input
            type="text"
            placeholder="Coming Soon"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled
          />

        </div>

        <br />

        {/* ===========================
            Current Feature
            Image Upload
        =========================== */}

        <div>

          <label>Upload Handwritten Scripture</label>

          <br />

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />

        </div>

        <br />

        {selectedImage && (

          <p>

            Selected File:

            {" "}

            {selectedImage.name}

          </p>

        )}

        <br />

        {/* ===========================
            Future Feature
            Key Verse
        =========================== */}

        <div>

          <label>Key Verse</label>

          <textarea
            placeholder="Coming Soon"
            value={keyVerse}
            onChange={(e) => setKeyVerse(e.target.value)}
            disabled
          />

        </div>

        <br />

        {/* ===========================
            Future Feature
            QT
        =========================== */}

        <div>

          <label>QT Notes</label>

          <textarea
            placeholder="Coming Soon"
            value={qt}
            onChange={(e) => setQt(e.target.value)}
            disabled
          />

        </div>

        <br />

        {/* ===========================
            Future Feature
            OCR / AI Result
        =========================== */}

        <div>

          <label>Recognition Result</label>

          <textarea
            placeholder="Coming Soon"
            value={result}
            onChange={(e) => setResult(e.target.value)}
            disabled
          />

        </div>

        <br />

        <button type="submit">

          Upload

        </button>

      </form>

    </div>

  );

}

export default WritingPage;
