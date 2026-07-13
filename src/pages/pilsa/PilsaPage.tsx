import { useEffect, useState } from "react";
import "./WritingPage.css";



function WritingPage() {
 
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

 
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

 
  const [error, setError] = useState("");

 
  const [isLoading, setIsLoading] = useState(false);


  const [range, setRange] = useState("");
  const [language, setLanguage] = useState("");
  const [keyVerse, setKeyVerse] = useState("");
  const [qt, setQt] = useState("");
  const [result, setResult] = useState("");




  useEffect(() => {
    if (!selectedImage) {
      setPreviewUrl(null);
      return;
    }

  
    const objectUrl = URL.createObjectURL(selectedImage);
    setPreviewUrl(objectUrl);

   
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedImage]);

  

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    setSelectedImage(event.target.files[0]);
    setError(""); // clear any previous "please upload an image" error
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!selectedImage) {
      setError("Please upload an image of your handwritten scripture.");
      return;
    }

  
    setIsLoading(true);
    setTimeout(() => {
      console.log("Submitting Writing Record", {
        range,
        language,
        selectedImage,
        keyVerse,
        qt,
        result,
      });
      setIsLoading(false);
      // TODO: send data to backend
    }, 1200);
  };



  return (
    <div className="writing-page">
      <div className="writing-container">
        <h1 className="writing-title">Scripture Writing</h1>
        <p className="writing-subtitle">
          Copy today's verse, upload it, and keep the moment.
        </p>

        <form className="writing-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

       
          <div className="form-group">
            <div className="label-row">
              <label htmlFor="range">Scripture Range</label>
              <span className="badge">Coming soon</span>
            </div>
            <input
              id="range"
              type="text"
              placeholder="e.g. Psalm 23:1-6"
              value={range}
              onChange={(e) => setRange(e.target.value)}
              disabled
            />
          </div>

         
          <div className="form-group">
            <div className="label-row">
              <label htmlFor="language">Language</label>
              <span className="badge">Coming soon</span>
            </div>
            <input
              id="language"
              type="text"
              placeholder="e.g. Korean / English"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled
            />
          </div>

         
          <div className="form-group">
            <label htmlFor="image-upload">Upload Handwritten Scripture</label>

         
            <label htmlFor="image-upload" className="upload-dropzone">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview of uploaded scripture" className="upload-preview" />
              ) : (
                <span className="upload-placeholder">
                  📷 Tap to select a photo
                </span>
              )}
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="upload-input"
            />

            {selectedImage && (
              <p className="file-name">Selected file: {selectedImage.name}</p>
            )}
          </div>

        
          <div className="form-group">
            <div className="label-row">
              <label htmlFor="key-verse">Key Verse</label>
              <span className="badge">Coming soon</span>
            </div>
            <textarea
              id="key-verse"
              placeholder="Which verse stood out to you?"
              value={keyVerse}
              onChange={(e) => setKeyVerse(e.target.value)}
              disabled
            />
          </div>

       
          <div className="form-group">
            <div className="label-row">
              <label htmlFor="qt">QT Notes</label>
              <span className="badge">Coming soon</span>
            </div>
            <textarea
              id="qt"
              placeholder="What is this verse teaching you?"
              value={qt}
              onChange={(e) => setQt(e.target.value)}
              disabled
            />
          </div>

        
          <div className="form-group">
            <div className="label-row">
              <label htmlFor="result">Recognition Result</label>
              <span className="badge">Coming soon</span>
            </div>
            <textarea
              id="result"
              placeholder="Transcribed text will appear here"
              value={result}
              onChange={(e) => setResult(e.target.value)}
              disabled
            />
          </div>

          <button className="submit-button" type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Upload"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default WritingPage;
