import React from "react";

export default function Sidebar({
  nodeText,
  setNodeText,
  nodeImg,
  setNodeImg,
  nodeColor,
  setNodeColor,
  selectedNode,
  setSelectedElements,
}) {
  const handleInputChange = (event) => {
    setNodeText(event.target.value);
  };

  const handleImageUrlChange = (event) => {
    setNodeImg(event.target.value);
  };

  const handleColorChange = (event) => {
    setNodeColor(event.target.value)
  };

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="border-r-2 border-gray-200 p-4 text-sm bg-gray-100 w-64 h-screen text-black">
      {selectedNode ? (
        <div>
          <h3 className="text-xl mb-2 text-blue-900">Update Node</h3>
          {selectedNode.type === "textnode" ? (
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">Node Text:</label>
              <input
                type="text"
                className="block w-full pt-2 px-3 pb-3 text-gray-700 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-gray-500"
                value={nodeText}
                onChange={handleInputChange}
              />
            </div>
          ) : selectedNode.type === "imagenode" ? (
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">Image URL:</label>
              <input
                type="text"
                className="block w-full pt-2 px-3 pb-3 text-gray-700 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-gray-500"
                value={nodeImg || ""}
                onChange={handleImageUrlChange}
              />
            </div>
          ) : selectedNode.type === "colorpickernode" ? (
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">Select Color:</label>
              <input
                type="color"
                className={`w-full pt-2 px-3 pb-3 text-${nodeColor}-700 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-gray-500`}
                value={nodeColor || ""}
                onChange={handleColorChange}
              />
            </div>
          ) : null}
          <button
            className="mt-4 bg-gray-500 text-white rounded p-2 hover:bg-gray-600"
            onClick={() => setSelectedElements([])}
          >
            Go Back
          </button>
        </div>
      ) : (
        <>
          <h3 className="text-xl mb-4 text-blue-900">Nodes Panel</h3>
          <div
            className="bg-white p-3 border-2 border-gray-500 rounded cursor-move flex justify-center items-center text-gray-500 hover:bg-gray-500 hover:text-white transition-colors duration-200"
            onDragStart={(event) => onDragStart(event, "textnode")}
            draggable
          >
            Message Node
          </div>
          <div
            className="bg-white p-3 border-2 border-gray-500 rounded cursor-move flex justify-center items-center text-gray-500 hover:bg-gray-500 hover:text-white transition-colors duration-200 mt-4"
            onDragStart={(event) => onDragStart(event, "imagenode")}
            draggable
          >
            Image Node
          </div>
          <div
            className="bg-white p-3 border-2 border-gray-500 rounded cursor-move flex justify-center items-center text-gray-500 hover:bg-gray-500 hover:text-white transition-colors duration-200 mt-4"
            onDragStart={(event) => onDragStart(event, "colorpickernode")}
            draggable
          >
            Color Picker Node
          </div>
        </>
      )}
    </aside>
  );
}
