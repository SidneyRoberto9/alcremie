import { Box } from "@/components/Box"
import { FilesView } from "@/components/upload/FilesView"
import { Send } from "@/components/upload/Send"
import { UploadArea } from "@/components/upload/UploadArea"
export default function page() {
  return (
    <Box className="m-auto mt-10 max-w-7xl">
      <UploadArea />
      <FilesView />
      <Send />
    </Box>
  )
}
