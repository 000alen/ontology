import React from "react"

import { Visualization } from "../../components/Visualization";
import { useAxis } from "../../hooks/useAxis";
import { useParams } from "react-router-dom";

export default function Page() {
    const { id } = useParams()

    if (!id) {
        throw new Error("No axis ID provided")
    }

    const { axis } = useAxis(id)

    if (!axis) {
        return <div>Axis not found</div>
    }

    return <Visualization axes={[axis]} />
}
