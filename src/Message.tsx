import * as React from "react";


export interface MessageProps {
    message: string;
}
export class Message1 extends React.Component<MessageProps> {

    render () {
        return (
            <p>
                <span>hello {this.props.message}</span>
            </p>
        );
    }

}

export function Message2 ({ message }: MessageProps) {
    return (
        <p>
            <span>hello {message}</span>
        </p>
    );
}
