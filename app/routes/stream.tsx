import { LoaderFunction } from "@remix-run/node";
import { createEventStream } from "~/utils/create-event-stream.server";

export const loader : LoaderFunction = async ({request, params}) => {

  return createEventStream(request, "chat")

}