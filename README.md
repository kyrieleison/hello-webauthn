# Web Authentication API

## [Web authentification concepts and usage](https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API)

Web Authentication API (WebAuthn とも呼ばれる) は、Web サイトでの登録やログイン、二要素認証を行うために、パスワードや SMS メッセージの代わりに非対称 (公開鍵) 暗号方式を用いる。これはフィッシング、データ侵害、SMS メッセージやその他の二要素認証方式に対する攻撃におけるセキュリティ問題を解決します。また、ユーザは複雑化するパスワードを何十も管理する必要がなくなるため、使いやすさが大幅に向上します。

多くの Web サイトでは、新しいアカウントの登録やログインの手段が既に用意されています。そのため WebAuthn は、これらの代替または補完として機能します。Credential Management API の形式と同様に、Web Authentification API は登録とログインの2つの基本的なメソッドを持っています。

- `navigator.credentials.create()`
  - `publicKey` オプションと共に使用します。新しいクレデンシャルを作成し、新しいアカウントに登録するか、または既存のアカウントに新しいクレデンシャルを関連付けます
- `navigator.credentials.get()`
  - `publicKey` オプションと共に使用します。そのサービスで認証するための既存のクレデンシャルを使用し、ログインするか、または二要素認証の一要素として機能します

NOTE: `create()` と `get()` のいずれも Secure Context (HTTPS か localhost であること) を要求します。ブラウザが Secure Context で動作していない場合は使用できません

最も基本的な方式では、`create()` と `get()` の両方で、サーバからチャレンジと呼ばれる非常に大きな乱数を受け取り、秘密鍵で署名されたチャレンジをサーバに返却します。これは、ネットワーク上に秘密情報を明らかにすることなく、認証に必要な秘密鍵をユーザが所有していることをサーバに証明します。

`create()` と `get()` メソッドがどのように適合するのかをより大きなイメージで理解するには、それらがブラウザ外の2つのコンポーネント間にあることを理解することが重要です。

- サーバ
  - WebAuthn API は、サーバ (サービスまたは Relying Party とも呼ばれる) に新しいクレデンシャルを登録し、その後、同じサーバで同じクレデンシャルを使用してユーザを認証することを目的としています
- 認証器
  - クレデンシャルは作成されると、認証器と呼ばれるデバイスに保持されます。これは認証における新しいコンセプトです。パスワードを用いて認証する場合、パスワードはユーザの頭の中に保持されており、他のデバイスは必要ありません。WebAuthn を用いて認証する場合、パスワードは認証器に保持された鍵ペアに置き換えられます。認証器は Windows のようなオペレーティングシステムに組み込まれていても良く、USB または Bluetooth セキュリティキーのような物理トークンであっても良い。

### Registration
典型的な Registration プロセスは 6 ステップあります。

1. サーバはチャレンジ、ユーザ情報、Relying Party 情報を `PublicKeyCredentialCreateOptions` としてクライアントに送る
2. クライアントはチャレンジ、ユーザ情報、Relying Party 情報、`clientDataHash` を認証器に送る
3. 認証器はユーザの検証を行い、新しい鍵ペアとアテステーションを生成する
4. 認証器は新しい公開鍵、クレデンシャルID、アテステーションを `attestationObject` としてクライアントに送る
5. クライアントは `clientData` と `attestationObject` を `AuthenticatorAttestationResponce` としてサーバに送る
6. サーバで検証を行い、登録を完了する

アプリケーションを作成する JavaScript プログラマは、`create()` メソッドが呼び出されて返却される、手順 1,5 だけを意識します。しかしながら、クライアントと認証器で行われる処理とその結果のデータの意味を理解するためには、手順 2,3,4 が不可欠です。

### Authentication
ユーザが WebAuthn による登録を終えた後、サービスで Authentication (ログインまたはサインインとも呼ばれる) を行うことができます。Authentication フローは Registration フローに似ています。最も重要な違いは、ユーザまたは Relying Party の情報を必要としないことです。

1. サーバはチャレンジを `PublicKeyCredentialRequestOptions` としてクライアントに送る
2. クライアントはチャレンジ、Relying Party ID、`clientDataHash` を認証器に送る
3. 認証器はユーザの検証を行い、アサーションを生成する
4. 認証器は `authenticatorData` と署名をクライアントに送る
5. クライアントは `clientDataJSON` と `authenticatorData`、署名を `AuthenticatorAssertionResponce` としてサーバに送る
6. サーバで検証を行い、認証を完了する
