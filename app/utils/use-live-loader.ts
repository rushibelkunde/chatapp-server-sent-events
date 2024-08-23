import { resolvePath, useLoaderData, useRevalidator } from "@remix-run/react"
import { useEventSource } from "remix-utils/sse/react"
import { useEffect } from "react"


export const useLiveLoader = <T>() => {

  const path = resolvePath('/stream').pathname
  const data = useEventSource(path)

  const {revalidate} = useRevalidator()
  useEffect(()=> {
    revalidate()
  }, [data])



  return useLoaderData<T>()
}