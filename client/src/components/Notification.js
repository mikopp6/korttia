import React from 'react'
import {createPortal} from 'react-dom'

// container/notification code from https://tinloof.com/blog/how-to-create-react-notifications-with-0-dependencies
const createContainer = () => {
  const portalId = "notifyContainer"
  let element = document.getElementById(portalId)

  if (element) {
    return element
  }

  element = document.createElement("div")
  element.setAttribute("id", portalId)
  element.className = 'notification_container'
  document.body.appendChild(element)
  return element
}

const container = createContainer()

/* Notification, react component
*  params: message
*  returns: html
*
*  Shows notification at the top of the screen
*/
const Notification = ({ message }) => {
  if (message === null) {
    return null
  }

  return createPortal(
    <div className="notification">{message}</div>, container
  )

}

export default Notification