import { chat } from '@prisma/client'
import { ActionFunction, LoaderFunction } from '@remix-run/node'
import { Form, json, useLoaderData } from '@remix-run/react'
import React from 'react'
import { eventStream } from 'remix-utils/sse/server'
import { db } from '~/utils/db.server'
import { emitter } from '~/utils/emitter.server'
import { useLiveLoader } from '~/utils/use-live-loader'

export const loader : LoaderFunction = async ({request, params}) => {
  
  const chats = await db.chat.findMany()
  console.log(chats)
  return json({chats})

}

export const action : ActionFunction = async ({request, params}) => {

  const formData = Object.fromEntries(await request.formData())

  const action = formData.action

  switch(action){
    case "send-chat" : {
      const chat = formData.chat as string
      if(!chat){
        return json({message: "Chat can't be empty"})
      }
      await db.chat.create({
        data:{
          chat
        }
      })
      // send event 
      emitter.emit('chat')
      return null

    }
    case "delete-chat" : {

      const id = formData.id as string
      await db.chat.delete({where: {id}})
      emitter.emit('chat')
      return null
    }
   
  }

  
}

const Chat = () => {

  const {chats} = useLiveLoader<typeof loader>()
  return (
    <>
    <ul>
      {chats.map(({chat, id} : chat)=> (
        <li key={id}>
          <span>{chat}</span>
          <Form method='POST'>
            <input type="hidden" name="action" value={"delete-chat"} />
            <input type="hidden" name="id" value={id} />
            <button type='submit'>X</button>
          </Form>
        </li>
      ))}
    </ul>
      <Form method='POST'>
        <input type="hidden" name="action" value={"send-chat"}/>
        <input type="text" name='chat'  />
        <button type='submit'>Send</button>
      </Form>
    </>
  )
}

export default Chat