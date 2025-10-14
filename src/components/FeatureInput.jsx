import { useEffect, useState } from "react";

export default function FeatureInput({ index, setFeatures, features }) {
  const [feature, setFeature] = useState(features[index - 1] || "");

  useEffect(() => {
    setFeature(features[index - 1] || "");
  }, [features, index]);

  return (
    <div className="flex items-center gap-2">
      <h1>{index}</h1>
      <input
        type="text"
        value={feature}
        onChange={(e) => {
          setFeatures((prev) => {
            const newFeatures = [...prev];
            newFeatures[index - 1] = e.target.value;
            return newFeatures;
          });
        }}
        className="base-input-design w-full"
        placeholder="eg) Photo-based wardrobe manager with outfit combination generator"
      />
      <span
        onClick={() =>
          setFeatures((prev) => prev.filter((_, i) => i !== index - 1))
        }
        className="text-2xl text-center cursor-pointer"
      >
        -
      </span>
    </div>
  );
}
