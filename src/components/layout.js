import * as React from "react"
import { useStaticQuery, graphql, Link } from "gatsby"
import styled from "styled-components"
import Hero from "./hero"
import { fullWindowWidth } from "../commonStyles"


const Footer = styled.footer`
  ${fullWindowWidth()}
  margin-top:auto;
  text-align: center;
  border-top: 0.5rem solid dodgerblue;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;

  & > * {
    margin-right: 15px;
  }

  @media only screen and (max-width: 500px) {
    // put website url on new line for mobile
    & > span {
      flex-basis: 500px;
    }
  }
  
  a,span {
    color: white;
  }
`

const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;

  .global-wrapper {
    margin-top: 18px;
  }
`


const Layout = ({ location, children }) => {
  const rootPath = `${__PATH_PREFIX__}/`
  const isRootPath = location.pathname === rootPath
  const data = useStaticQuery(graphql`
  query FooterQuery {
    site {
      siteMetadata {
        author {
          name
          summary
        }
        social {
          twitter
          linkedIn
        }
        siteUrl
      }
    }
  }
  `)
  const social = data.site.siteMetadata.social

  return (
    <Wrapper>
      <Hero />
      <div className="global-wrapper" data-is-root-path={isRootPath}>
        <main>{children}</main>
      </div>
      <Footer>
          <span>© {new Date().getFullYear()} <Link to="/">adrian-thomas.com</Link></span>

          <a href={`https://twitter.com/${social.twitter}`} target="_blank" rel="noreferrer">
            Twitter
          </a>

          <a href={`https://www.linkedin.com/in/${social.linkedIn}`} target="_blank" rel="noreferrer">
            LinkedIn
          </a>

          <Link to="/blog">Blog</Link>

          <Link to="/rss.xml" target="_blank" rel="noreferrer">RSS</Link>
        </Footer>
    </Wrapper>
  )
}

export default Layout
