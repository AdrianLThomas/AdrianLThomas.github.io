import * as React from "react"
import { Link } from "gatsby"
import styled from "styled-components"

import Bio from "../components/bio"
import { fullWindowWidth } from "../commonStyles"

const Container = styled.div`
    ${fullWindowWidth()}
    height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
` 

const Hero = () => {
  return (
    <Container>
        <Link to="/"><h1>Adrian L Thomas</h1></Link>
        <Bio />
    </Container>
  )
}

export default Hero