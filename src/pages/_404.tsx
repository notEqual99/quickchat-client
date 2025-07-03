import DecryptedText from "../components/DecryptedText"

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-terminal-bg p-4">
      <div className="border border-terminal-accent p-8 rounded-lg w-full max-w-2xl">
        <div className="flex items-center mb-6">
        	<div className="ml-4 text-terminal-accent text-lg">
				<DecryptedText
					text="404 NOT FOUND"
					speed={20}
					maxIterations={20}
					className="revealed"
					parentClassName="all-letters"
					encryptedClassName="encrypted"
					animateOn="view"
				/>
			</div>
        </div>
        
        <div className="font-mono text-terminal-text">
          <p className="text-terminal-accent">$ 
			<span className="text-terminal-text">
			  <DecryptedText
				text="error 404: page not found"
				speed={20}
				maxIterations={20}
				className="revealed"
				parentClassName="all-letters"
				encryptedClassName="encrypted"
				animateOn="view"
			  />
			</span>
		  </p>
          <p className="mt-4">
			<DecryptedText
				text="The requested URL was not found on this server."
				speed={20}
				maxIterations={20}
				className="revealed"
				parentClassName="all-letters"
				encryptedClassName="encrypted"
				animateOn="view"
			/>
		  </p>
          <p className="mt-2">
			<DecryptedText
				text="Available commands:"
				speed={20}
				maxIterations={20}
				className="revealed"
				parentClassName="all-letters"
				encryptedClassName="encrypted"
				animateOn="view"
			/>
		  </p>
          <ul className="list-disc pl-6 mt-2 text-terminal-text/80">
            <li>
				<DecryptedText
					text="Go back to "
					speed={20}
					maxIterations={20}
					className="revealed"
					parentClassName="all-letters"
					encryptedClassName="encrypted"
					animateOn="view"
				/>
				<a href="/" className="text-terminal-accent hover:underline">
				<DecryptedText
					text="homepage"
					speed={20}
					maxIterations={20}
					className="revealed"
					parentClassName="all-letters"
					encryptedClassName="encrypted"
					animateOn="view"
				/>
				</a>
			</li>
            <li>
				<DecryptedText
					text="Check the URL for typos"
					speed={20}
					maxIterations={20}
					className="revealed"
					parentClassName="all-letters"
					encryptedClassName="encrypted"
					animateOn="view"
				/>
			</li>
            <li>
				<DecryptedText
					text="Or try again later"
					speed={20}
					maxIterations={20}
					className="revealed"
					parentClassName="all-letters"
					encryptedClassName="encrypted"
					animateOn="view"
				/>
			</li>
          </ul>
          <div className="mt-6 text-sm text-terminal-text/50">
				<DecryptedText
					text="// Tip: Make sure you have the correct permissions"
					speed={20}
					maxIterations={20}
					className="revealed"
					parentClassName="all-letters"
					encryptedClassName="encrypted"
					animateOn="view"
				/>
				<p>
				<DecryptedText
					text="// Status: 404 - Not Found"
					speed={20}
					maxIterations={20}
					className="revealed"
					parentClassName="all-letters"
					encryptedClassName="encrypted"
					animateOn="view"
				/>
				</p>
          </div>
        </div>
      </div>
    </div>
  );
}
