import React from "react"

import { Visualization } from "../../components/Visualization";
import { useAxis } from "../../hooks/useAxis";
import { useParams } from "react-router-dom";

export default function Page() {
    const { id } = useParams()

    if (!id) {
        return <div>No axis ID provided</div>
    }

    const {
        axis,
        loadAxis,
        clearAxis,
        highlightedNode,
        highlightedEdge,
        setHighlightedNode,
        setHighlightedEdge,
    } = useAxis(id)

    if (!axis) {
        return <div>Axis not found</div>
    }

    return <Visualization
        axes={[axis]}
        highlightedNode={highlightedNode}
        highlightedEdge={highlightedEdge}
        setHighlightedNode={setHighlightedNode}
        setHighlightedEdge={setHighlightedEdge}
        onClearAxes={clearAxis}
    />
}
