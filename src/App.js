import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Panel,
  useReactFlow,
  MiniMap,
  Controls,
  Background,
} from "reactflow";
import "reactflow/dist/base.css";
import Sidebar from "./components/Sidebar.jsx";
import TextNode from "./components/TextNode.jsx";
import ImageNode from "./components/ImageNode.jsx";
import ColorPickerNode from "./components/ColorPickerNode.jsx";

// Key for local storage
const flowKey = "flow-key";

// Initial nodes setup
const initialNodes = [
  {
    id: "node_0",
    type: "textnode",
    data: { text: "Text Node" },
    position: { x: 100, y: 5 },
  },
  {
    id: "node_1",
    type: "imagenode",
    data: {
      imageUrl:
        "https://tse3.mm.bing.net/th?id=OIP.p7wO15QaqNIJVmkrh7Y7FwHaEK&pid=Api&P=0&h=180",
    },
    position: { x: 300, y: 5 },
  },
  {
    id: "node_2",
    type: "colorpickernode",
    data: { color: "#000" },
    position: { x: 500, y: 5 },
  },
];

// Function for generating unique IDs for nodes
let id = 3;
const getId = () => `node_${id++}`;

const FlowWithProvider = () => {
  // States and hooks setup
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selectedElements, setSelectedElements] = useState([]);
  const [nodeText, setNodeText] = useState("");
  const [nodeImg, setNodeImg] = useState("");
  const [nodeColor, setNodeColor] = useState("");

  // Define custom node types
  const nodeTypes = useMemo(
    () => ({
      textnode: TextNode,
      colorpickernode: ColorPickerNode,
      imagenode: ImageNode,
    }),
    []
  );

  // Update nodes data when nodeText or selectedElements changes
  useEffect(() => {
    if (selectedElements.length > 0) {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === selectedElements[0]?.id) {
            let updatedData = {};
            if (selectedElements[0].type === "textnode") {
              updatedData = {
                ...node.data,
                text: nodeText,
              };
            } else if (selectedElements[0].type === "imagenode") {
              updatedData = {
                ...node.data,
                imageUrl: nodeImg,
              };
            } else if (selectedElements[0].type === "colorpickernode") {
              updatedData = {
                ...node.data,
                color: nodeColor,
              };
            }
            return {
              ...node,
              data: updatedData,
            };
          }
          return node;
        })
      );
    } else {
      setNodeText(""); // Clear nodeText when no node is selected
      setNodeImg(""); // Clear nodeImg when no node is selected
      setNodeColor(""); // Clear nodeColor when no node is selected
    }
  }, [nodeText, nodeColor, nodeImg, selectedElements, setNodes]);

  // Handle node click
  const onNodeClick = useCallback(
    (event, node) => {
      setSelectedElements([node]);
      if (node.type === "textnode") {
        setNodeText(node.data.text);
      } else if (node.type === "imagenode") {
        setNodeImg(node.data.imageUrl);
      } else if (node.type === "colorpickernode") {
        setNodeColor(node.data.color);
      }
      setNodes((nodes) =>
        nodes.map((n) => ({
          ...n,
          selected: n.id === node.id,
        }))
      );
    },
    [setNodes]
  );

  // Setup viewport
  const { setViewport } = useReactFlow();

  // Check for empty target handles
  const checkEmptyTargetHandles = () => {
    let emptyTargetHandles = 0;
    edges.forEach((edge) => {
      if (!edge.targetHandle) {
        emptyTargetHandles++;
      }
    });
    return emptyTargetHandles;
  };

  // Check if any node is unconnected
  const isNodeUnconnected = useCallback(() => {
    let unconnectedNodes = nodes.filter(
      (node) =>
        !edges.find(
          (edge) => edge.source === node.id || edge.target === node.id
        )
    );
    return unconnectedNodes.length > 0;
  }, [nodes, edges]);

  // Save flow to local storage
  const onSave = useCallback(() => {
    if (reactFlowInstance) {
      const emptyTargetHandles = checkEmptyTargetHandles();
      if (nodes.length > 1 && (emptyTargetHandles > 1 || isNodeUnconnected())) {
        alert(
          "Error: More than one node has an empty target handle or there are unconnected nodes."
        );
      } else {
        const flow = reactFlowInstance.toObject();
        localStorage.setItem(flowKey, JSON.stringify(flow));
        alert("Save successful!"); // Provide feedback when save is successful
      }
    }
  }, [reactFlowInstance, nodes, isNodeUnconnected]);

  // Restore flow from local storage
  const onRestore = useCallback(() => {
    const restoreFlow = async () => {
      const flow = JSON.parse(localStorage.getItem(flowKey));
      if (flow) {
        const { x = 0, y = 0, zoom = 1 } = flow.viewport;
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
        setViewport({ x, y, zoom });
      }
    };
    restoreFlow();
  }, [setNodes, setViewport, setEdges]);

  // Handle edge connection
  const onConnect = useCallback(
    (params) => {
      const { source, sourceHandle } = params;
      // Check if the source handle already has an edge connected
      const isSourceHandleOccupied = edges.some(
        (edge) => edge.source === source && edge.sourceHandle === sourceHandle
      );
      // If the source handle is already occupied, prevent the connection
      if (isSourceHandleOccupied) {
        alert("Source handle already occupied.");
        return;
      }
      console.log("Edge created: ", params);
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges, edges]
  );

  // Enable drop effect on drag over
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // Handle drop event to add a new node
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow");
      if (typeof type === "undefined" || !type) {
        return;
      }
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      const newNode = {
        id: getId(),
        type,
        position,
        data: {
          label: `${
            type === "textnode"
              ? "Text Node"
              : type === "imagenode"
              ? "Image Node"
              : "Color Picker Node"
          }`,
          text: type === "textnode" ? "Text Node" : undefined, // Initialize text for text node
          imageUrl:
            type === "imagenode"
              ? "https://tse3.mm.bing.net/th?id=OIP.p7wO15QaqNIJVmkrh7Y7FwHaEK&pid=Api&P=0&h=180"
              : undefined, // Initialize image URL for image node
          color: type === "colorpickernode" ? "#000" : undefined, // Initialize color for color picker node
        },
      };
      console.log("Node created: ", newNode);
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const rfStyle = {
    backgroundColor: "#ffffff",
  };

  return (
    <div className="flex flex-row min-h-screen lg:flex-row">
      <div className="flex-grow h-screen" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          nodeTypes={nodeTypes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          style={rfStyle}
          onNodeClick={onNodeClick}
          onPaneClick={() => {
            setSelectedElements([]); // Reset selected elements when clicking on pane
            setNodes((nodes) =>
              nodes.map((n) => ({
                ...n,
                selected: false, // Reset selected state of nodes when clicking on pane
              }))
            );
          }}
          fitView
        >
          <Background variant="dots" gap={12} size={1} />
          <Controls />
          <MiniMap zoomable pannable />
          <Panel>
            <button
              className=" m-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              onClick={onSave}
            >
              save flow
            </button>
            <button
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              onClick={onRestore}
            >
              restore flow
            </button>
          </Panel>
        </ReactFlow>
      </div>

      <Sidebar
        selectedNode={selectedElements[0]}
        setSelectedElements={setSelectedElements}
        nodeText={nodeText}
        setNodeText={setNodeText}
        nodeImg={nodeImg}
        setNodeImg={setNodeImg}
        nodeColor={nodeColor}
        setNodeColor={setNodeColor}
      />
    </div>
  );
};

// Wrap App with ReactFlowProvider
function App() {
  return (
    <ReactFlowProvider>
      <FlowWithProvider />
    </ReactFlowProvider>
  );
}

export default App;
