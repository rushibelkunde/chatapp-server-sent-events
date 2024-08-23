import { chat } from "@prisma/client";
import { ActionFunction, LoaderFunction } from "@remix-run/node";
import { Form, json, useLoaderData } from "@remix-run/react";
import React from "react";
import { eventStream } from "remix-utils/sse/server";
import { db } from "~/utils/db.server";
import { emitter } from "~/utils/emitter.server";
import { useLiveLoader } from "~/utils/use-live-loader";

export const loader: LoaderFunction = async ({ request, params }) => {
  const chats = await db.chat.findMany();
  console.log(chats);
  return json({ chats });
};

export const action: ActionFunction = async ({ request, params }) => {
  const formData = Object.fromEntries(await request.formData());

  const action = formData.action;

  switch (action) {
    case "send-chat": {
      const chat = formData.chat as string;
      if (!chat) {
        return json({ message: "Chat can't be empty" });
      }
      await db.chat.create({
        data: {
          chat,
        },
      });
      // send event
      emitter.emit("chat");
      return null;
    }
    case "delete-chat": {
      const id = formData.id as string;
      await db.chat.delete({ where: { id } });
      emitter.emit("chat");
      return null;
    }
  }
};

const Chat = () => {
  const { chats } = useLiveLoader<typeof loader>();
  return (
    <section className="container m-auto">
      <ul className="space-y-4">
        {chats.map(({ chat, id } : chat) => (
          <li
            key={id}
            className="flex items-center justify-between bg-gray-100 p-4 rounded-lg shadow"
          >
            <span className="text-gray-800">{chat}</span>
            <Form method="POST">
              <input type="hidden" name="action" value={"delete-chat"} />
              <input type="hidden" name="id" value={id} />
              <button
                type="submit"
                className="ml-4 p-2 bg-red-500 text-white rounded hover:bg-red-700 transition-colors"
              >
                X
              </button>
            </Form>
          </li>
        ))}
      </ul>
      <Form method="POST" className="mt-6 flex items-center">
        <input type="hidden" name="action" value={"send-chat"} />
        <input
          type="text"
          name="chat"
          className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:border-blue-500"
          placeholder="Type your message..."
        />
        <button
          type="submit"
          className="p-3 bg-blue-500 text-white rounded-r-lg hover:bg-blue-700 transition-colors"
        >
          Send
        </button>
      </Form>
    </section>
  );
};

export default Chat;
