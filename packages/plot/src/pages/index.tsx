import React from "react";

import { useAxes } from "../hooks/useAxes";
import { Gallery } from "../components/Gallery";

export default function Page() {
    const { axes } = useAxes()

    return <Gallery axes={axes} />
}
