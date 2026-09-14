import Script from "next/script"
import { Fragment } from "react"

export function Analytics() {
  return (
    <Fragment>
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-ZTDRJJ1SVL" strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-ZTDRJJ1SVL');
        `}
      </Script>
    </Fragment>
  )
}
